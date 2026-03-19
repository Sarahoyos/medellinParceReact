import { Usuario } from "./usuario"

export function inicioSesion(username, password) {
  const usuario = new Usuario("", "", "", "");
  return usuario.login(username, password);
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