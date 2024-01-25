import { auth } from "@/config/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Link from "next/link";

export default function Header() {
  const router = useRouter();
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };
  return (
    <>
      <header className="h-[70px] bg-white shadow-lg fixed top-0 w-full z-50 flex justify-around flex-row items-center ">
        <Link href="/inicio" className="p-3">
          Inicio
        </Link>
        <button onClick={handleLogout} className="p-3">
          <ExitToAppIcon />
        </button>
      </header>
    </>
  );
}
