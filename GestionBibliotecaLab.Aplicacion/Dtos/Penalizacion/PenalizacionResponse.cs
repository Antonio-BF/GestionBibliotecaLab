namespace GestionBibliotecaLab.Aplicacion.Dtos.Penalizacion
{
    public class PenalizacionResponse
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public string NombreUsuario { get; set; } = null!;
        public string EmailUsuario { get; set; } = null!;
        public int? PrestamoId { get; set; }
        public int? ReservaLabId { get; set; }
        public string Tipo { get; set; } = null!;
        public string Motivo { get; set; } = null!;
        public decimal? Monto { get; set; }
        public DateTime FechaGeneracion { get; set; }
        public DateTime? FechaResolucion { get; set; }
        public string Estado { get; set; } = null!;
    }
}
