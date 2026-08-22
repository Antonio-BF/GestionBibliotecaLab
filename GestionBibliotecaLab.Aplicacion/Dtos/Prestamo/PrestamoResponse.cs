namespace GestionBibliotecaLab.Aplicacion.Dtos.Prestamo
{
    public class PrestamoResponse
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public string NombreUsuario { get; set; } = null!;
        public int LibroId { get; set; }
        public string TituloLibro { get; set; } = null!;
        public DateTime FechaPrestamo { get; set; }
        public DateTime FechaDevolucionEsperada { get; set; }
        public DateTime? FechaDevolucionReal { get; set; }
        public string Estado { get; set; } = null!;
    }
}
