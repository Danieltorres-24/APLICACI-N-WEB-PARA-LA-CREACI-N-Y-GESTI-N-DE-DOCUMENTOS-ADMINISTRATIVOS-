create table areas (
IdArea int auto_increment primary key,
nombre varchar (100),
UI varchar (10),
CC varchar (10),
siglas varchar (5),
fecha varchar (5)
);

CREATE TABLE salidas (
IdSalida INT AUTO_INCREMENT PRIMARY KEY,
origenArea varchar(100),
Asunto varchar(150),
folio VARCHAR(100),
tipo ENUM('memorándum', 'oficio'),
fecha_registro date,
IdUsuario INT,
documento VARCHAR(200),
CONSTRAINT fk_usuario FOREIGN KEY (IdUsuario) REFERENCES usuarios(IdUsuario)
);

CREATE TABLE entrada (
  IdEntrada INT AUTO_INCREMENT PRIMARY KEY,
  folio varchar(100),
  area_origen VARCHAR(100),
  resumen VARCHAR(200),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_id INT, 
  documento VARCHAR(200),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(Idusuario)
);
