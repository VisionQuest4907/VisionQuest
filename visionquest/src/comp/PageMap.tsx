import { Link, Outlet } from 'react-router-dom';

export default function PageMap() {
    return(
        <>
            <nav>
                <Link to="/"></Link>
            </nav>
            <Outlet />
        </>
    );
}
