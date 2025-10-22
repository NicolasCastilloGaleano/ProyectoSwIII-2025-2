// import { logout } from "@/apps/auth/service/auth";
// import SOFTWARE_THEME from "@/config/theme";
// import { getUserByToken } from "@/services/authService/authService";
// import useStore from "@/store/useStore";
// import { useEffect } from "react";
// import { Outlet, useNavigate } from "react-router-dom";
// import GlobalSnackbar from "../components/system/GlobalSnackbar";
// import { PUBLICROUTES } from "./public.routes";

// const PrivateLayout = () => {
//   const { isSidebarOpen } = useStore((store) => store.screen);
//   const { token } = useStore((store) => store.authState.auth);
//   const setCurrentUser = useStore((store) => store.authState.setCurrentUser);
//   const setIsSidebarOpen = useStore((store) => store.setIsSidebarOpen);
//   const setScreenSize = useStore((store) => store.setScreenSize);
//   const showSnackbar = useStore((state) => state.showSnackbar);

//   const navigate = useNavigate();

//   useEffect(() => {
//     const handleResize = () => {
//       setScreenSize(window.innerWidth);
//       if (window.innerWidth <= 768) {
//         setIsSidebarOpen(false);
//       }
//     };

//     window.addEventListener("resize", handleResize);
//     handleResize();

//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const getUser = async () => {
//     const res = await getUserByToken();
//     if (!res.success) {
//       showSnackbar(res.error, "error");
//       if (
//         typeof res.error === "string" &&
//         res.error
//           .trim()
//           .toLowerCase()
//           .includes("error inesperado con la sesión")
//       ) {
//         try {
//           await logout();
//         } finally {
//           navigate(PUBLICROUTES.LOGIN, { replace: true });
//         }
//       }
//       return;
//     }
//     setCurrentUser(res.data);
//   };

//   useEffect(() => {
//     getUser();
//   }, [token]);

//   return (
//     <div className="relative flex">
//       <InitParameters />

//       <GlobalSnackbar />

//       <div
//         className={`fixed z-10 h-screen transition-all duration-300 ${isSidebarOpen ? "w-60" : "w-0 md:w-20"}`}
//         style={{ backgroundColor: SOFTWARE_THEME.primary }}
//       >
//         <Sidebar />
//       </div>

//       <div
//         className={`min-h-screen w-full transition-all duration-300 ${isSidebarOpen ? "md:pl-60" : "md:pl-20"}`}
//       >
//         <Header />

//         <div
//           className={`flex min-h-[calc(100vh_-_40px)] w-full justify-center`}
//         >
//           <section className="h-[calc(100vh-40px)] w-full max-w-[1464px] overflow-y-auto py-4">
//             <Outlet />
//           </section>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PrivateLayout;
