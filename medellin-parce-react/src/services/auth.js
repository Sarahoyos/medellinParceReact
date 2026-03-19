import { Usuario } from "./usuario";

export function inicioSesion(username, password) {
  const usuarioData = Usuario.obtenerUsuario(username);

  if (usuarioData) {
    const usuario = new Usuario(
      usuarioData.fullname,
      usuarioData.email,
      usuarioData.username,
      usuarioData.password
    );

    return usuario.iniciarSesion(username, password); // Validate credentials
  }

  return false; // User not found
}

export function resetIntentos(username) {
  const usuario = Usuario.obtenerUsuario(username);

  if (usuario) {
    const userInstance = new Usuario(
      usuario.fullname,
      usuario.email,
      usuario.username,
      usuario.password
    );

    userInstance.intentos = usuario.intentos || 0;
    userInstance.telefono = usuario.telefono || "";

    return userInstance.desbloquearCuenta();
  }

  return false;
}
export { Usuario };