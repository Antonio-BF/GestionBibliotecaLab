namespace GestionBibliotecaLab.Aplicacion.Dtos.Usuario
{
    public class UsuarioResponse
    {
        public int Id { get; set; }
        public string Nombres { get; set; } = null!;
        public string Apellidos { get; set; } = null!;
        public string Email { get; set; } = null!;
        public int RolId { get; set; }
        public string NombreRol { get; set; } = null!;
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
        public bool IsDeleted { get; set; }
    }
}
