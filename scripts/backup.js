if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { execFile, execFileSync  } = require("child_process");
const path = require("path");
//file system for backups folder
const fs = require("fs");
const os = require("os");

const {S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand,} = require("@aws-sdk/client-s3");


function getTime(){

    //ISO Date format with colons and dots replaced for safety
    return new Date().toISOString().replace(/[:.]/g, "-");
}

function runMongoDump(mongoURI, archivePath) {
    return new Promise((resolve, reject) => {
        const args=[`--uri=${mongoURI}`, `--archive=${archivePath}`, "--gzip"];
        console.log(`Running mongodump with args: ${args.join(" ")}`);
        execFile("mongodump",args,{timeout:1000*60*15},(error, stdout, stderr) => {
            if(stdout) console.log(stdout.trim());
            if(stderr) console.log(stderr.trim());
            if(error) return reject(new Error(`mongodump failed: ${error.message}`));
            resolve();
        });
    });
}

async function cleanOldBackups(s3, bucket, prefix, maxBackups) {
    const listed=await s3.send(new ListObjectsV2Command({Bucket: bucket, Prefix: prefix}));
    const backups=(listed.Contents || []).filter(item=>item.Key && item.LastModified).sort((a,b)=>(a.LastModified?.getTime()||0)-(b.LastModified?.getTime()||0));
    const toDelete=backups.slice(0,Math.max(0, backups.length-maxBackups));
    if(toDelete.length===0) return;
    await s3.send(new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {Objects: toDelete.map(item=>({Key: item.Key}))}
    }));
    console.log(`Deleted ${toDelete.length} old backup(s) from S3`);
}



function hasMongoDump() {
  try {
    execFileSync("mongodump", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function main() {
    console.log("ENV CHECK:", {
  NODE_ENV: process.env.NODE_ENV,
  hasMONGO_URI: !!process.env.MONGO_URI,
  hasDB_URI: !!process.env.DB_URI,
  hasS3_BACKUP_BUCKET: !!process.env.S3_BACKUP_BUCKET,
  AWS_REGION: process.env.AWS_REGION,
  AWS_DEFAULT_REGION: process.env.AWS_DEFAULT_REGION
});
    const mongoURI = process.env.MONGO_URI || process.env.DB_URI;
    const bucket = process.env.S3_BACKUP_BUCKET;
    const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
    if(!mongoURI) throw new Error("MONGO_URI is not set");
    if(!bucket) throw new Error("S3_BACKUP_BUCKET is not set");
    if(!hasMongoDump()) {
        console.error("mongodump is not installed on this instance. Backup skipped.");
        process.exit(0);
    }
    const tmpDir=path.join(os.tmpdir(),"mongo-backups");
    fs.mkdirSync(tmpDir, {recursive:true});
    
    const tstamp=getTime();
    const fname=`backup-${tstamp}.archive.gz`;
    const lFile=path.join(tmpDir, fname);
    console.log(`Starting backup: ${lFile}`);
    
    await runMongoDump(mongoURI, lFile);
    console.log("Mongodump completed.");
    
    const s3=new S3Client({region});
    const key=`backups/${fname}`;

    try{
        await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fs.createReadStream(lFile),
        ContentType: "application/gzip",
    }));
    console.log(`Backup uploaded to S3: s3://${bucket}/${key}`);
    await cleanOldBackups(s3, bucket, "backups/", 5);

}catch(err){
    console.error("Failed to upload backup to S3:", err.message);
    throw err;
}finally{
    if(fs.existsSync(lFile)){
        fs.unlinkSync(lFile);
        console.log("Local backup file deleted.");
    }
}
    
    
    
    console.log("Backup process completed successfully.");
}
main().catch((err) => {
    console.error("Backup process failed:", err.message);
    process.exit(1);
});