import { auth } from "@/auth";
import { redirect } from "next/navigation";

const Home = async () => {
  const session = await auth();
  if (session?.user?.id) {
    return redirect(`/${session.user.role?.toLowerCase()}`);
  } else {
    redirect("/login");
  }
};
export default Home;
