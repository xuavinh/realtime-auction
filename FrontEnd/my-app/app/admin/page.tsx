'use client';

import { useRouter } from "next/navigation";
import Button from 'react-bootstrap/Button';

const VuDao = () => {
    const router = useRouter();

    const handleClick = () => {
        router.push("/");
    }
    return <div>
        VuDao
        <div>
            <Button variant="primary" onClick={handleClick}>
                Go to Home
            </Button>
        </div>
    </div>;
}
export default VuDao;