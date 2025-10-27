import UploadAvatars from "../components/uploadAvatars"

export default function ProfilePage() {
    return (
        <div className="p-8 py-10 flex flex-col gap-10 items-center ">
            <UploadAvatars></UploadAvatars>
            <h1 className="font-extrabold">
                Nombre de usuario
            </h1>
            <span> correo </span>
            <span> Direccion</span>
        </div>
    )
}
