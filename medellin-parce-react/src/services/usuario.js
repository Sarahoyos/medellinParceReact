class Usuario {
    constructor(fullname, email, username, password) {
      this.fullname = fullname;
      this.email = email;
      this.username = username;
      this.password = password;
      this.telefono = "";
      this.intentos = 0;
      this.intentoMax = 3;
    }
  
    registrar() {
      let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  
      const existe = usuarios.some(
        u => u.username === this.username || u.email === this.email
      );
  
      if (existe) {
        return { success: false, message: "El usuario o correo ya está registrado." };
      }
  
      usuarios.push(this);
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
  
      return { success: true, message: "Registro exitoso." };
    }
  
    iniciarSesion(username, password) {
      // Directly compare the provided username and password with the stored values
      return this.username === username && this.password === password;
    }
  
    static obtenerUsuario(usernameOrEmail) {
      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
      return usuarios.find(
        u => u.username === usernameOrEmail || u.email === usernameOrEmail
      );
    }
  }
  
  export { Usuario };