import { Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage.tsx';
import Dashboard from './dashboard.tsx';
import PageMap from './comp/PageMap.tsx';
import Setting from './Setting.tsx';
import CertView from './CertView.tsx';
import Download from './Download.tsx';
import ExpectModOne from './expectpage.tsx';
import VideoOne from './VideoOne.tsx';
import VideoTwo from './VideoTwo.tsx';
import VideoThree from './VideoThree.tsx';
import VideoFour from './VideoFour.tsx';
import GameOne from './ModOneGame.tsx';
import QuizOne from './QuizOne.tsx';
import ModOneCert from './ModOneCert.tsx';
import About from './About.tsx';
import RegistrationPage from './register.tsx';
import ExpectModTwo from './ModTwoExpect.tsx';
import VideoOneModTwo from './ModTwoVidOne.tsx';
import VideoTwoModTwo from './ModTwoVidTwo.tsx';
import ModTwoGameOne from './ModTwoGameOne.tsx';
import VideoThreeModTwo from './ModTwoVidThree.tsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PageMap />}>
        <Route path="/" element={<About />} />
        <Route path="/loginpage" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/setting" element={<Setting />} />
        <Route path="/certview" element={<CertView />} />
        <Route path="/download" element={<Download />} />
        <Route path="/moduleone/expectations" element={<ExpectModOne />} />
        <Route path="/moduleone/video-one" element={<VideoOne />} />
        <Route path="/moduleone/video-two" element={<VideoTwo />} />
        <Route path="/moduleone/video-three" element={<VideoThree />} />
        <Route path="/moduleone/video-four" element={<VideoFour />} />
        <Route path="/moduleone/game" element={<GameOne />} />
        <Route path="/moduleone/quiz" element={<QuizOne />} />
        <Route path="/moduleone/module-one-cert" element={<ModOneCert />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/moduletwo/expectations" element={<ExpectModTwo />} />
        <Route path="/moduletwo/video-one" element={<VideoOneModTwo />} />
        <Route path="/moduletwo/video-two" element={<VideoTwoModTwo />} />
        <Route path="/moduletwo/game-one" element={<ModTwoGameOne />} />
        <Route path="/moduletwo/video-three" element={<VideoThreeModTwo />} />
        <Route path="*" element={<div style={{ padding: '2rem' }}><h2>Page not found</h2></div>} />
      </Route>
    </Routes>
  );
}
