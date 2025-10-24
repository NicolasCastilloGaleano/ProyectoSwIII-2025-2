import { Link } from "react-router-dom"
const linkClass = "rounded-lg hover:bg-gray-500 text-center justify-center p-2 textApp flex items-center gap-6 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-violet-500"
const linkClassConfigButton = "rounded-lg hover:bg-gray-500 justify-center mt-auto text-center p-2 textApp flex items-center gap-6 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-violet-500 justify-items-end"
export function SideBar() {
    return (
        <div className="p-4 col-span-1 min-h-screen flex flex-col gap-4 font-extrabold w-1/5">
            <Link to="/dashboard" className={linkClass}>
                <img width={20} height={20} src="src\assets\home-1-svgrepo-com.svg" alt="Dashboard" />
                Principal
            </Link>

            <Link to="/Ejercicios" className={linkClass}>
                <img width={20} height={20} src="src\assets\share-svgrepo-com.svg" alt="Shared" />
                Ejercicios
            </Link>

            <Link to="/Desarrollo" className={linkClass}>
                <img
                    width={20}
                    height={20}
                    src="src\assets\storage-svgrepo-com.svg"
                    alt="Storage"
                />
                Desarrollo
            </Link>

            <Link to="/profile " className={linkClass}>
                <img
                    width={20}
                    height={20}
                    src="src\assets\user-svgrepo-com.svg"
                    alt="Trash"
                />
                Perfil
            </Link>
            <Link to="/improvementplan" className={linkClass}>
                <img
                    width={20}
                    height={20}
                    src="src\assets\menu-alt-1-svgrepo-com.svg"
                    alt="Trash"
                />
                Mejorar
            </Link>
            <Link to="/configuracion" className={linkClassConfigButton}>
                <img
                    width={20}
                    height={20}
                    src="src\assets\configuration-gear-options-preferences-settings-system-svgrepo-com.svg"
                    alt="Trash"
                />
                Configuración
            </Link>

        </div>
    );
}