namespace GestionBibliotecaLab.Aplicacion.Dtos.ReservaLab
{
    public class ReservaResponse
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public string NombreUsuario { get; set; } = null!;
        public string EmailUsuario { get; set; } = null!;
        public int LaboratorioId { get; set; }
        public string NombreLaboratorio { get; set; } = null!;
        public DateOnly Fecha { get; set; }
        public TimeOnly HoraInicio { get; set; }
        public TimeOnly HoraFin { get; set; }
        public string Estado { get; set; } = null!;
    }
}
