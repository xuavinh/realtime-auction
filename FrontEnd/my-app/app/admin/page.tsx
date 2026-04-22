'use client';

import { useRouter } from "next/navigation";
const VuDao = () => {
    const router = useRouter();

    const handleClick = () => {
        router.push("/");
    }
    return <div>
        VuDao
        <div>
            <button onClick={handleClick}>Go to Home</button>
        </div>
    </div>;
}
export default VuDao;