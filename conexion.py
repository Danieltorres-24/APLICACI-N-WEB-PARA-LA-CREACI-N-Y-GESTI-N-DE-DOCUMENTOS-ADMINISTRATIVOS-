import mysql.connector
from mysql.connector import Error

def get_connection():
    conexion = None
    try:
        conexion = mysql.connector.connect(
            host="localhost",
            port=3306,
            user="root",
            password="", 
            database="CODI"
        )

        if conexion.is_connected():
            print("Conexión exitosa")
            info_server = conexion.get_server_info()
            print(f"Información del servidor: {info_server}")
            return conexion
            
    except Error as ex:
        print(f"Error en la conexión de la BD: {ex}")

if __name__ == "__main__":
    conn = get_connection()
    
    if conn and conn.is_connected():
        conn.close()
        print("Conexión cerrada")