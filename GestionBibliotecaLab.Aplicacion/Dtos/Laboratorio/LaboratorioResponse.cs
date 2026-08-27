namespace GestionBibliotecaLab.Aplicacion.Dtos.Laboratorio
{
    public class LaboratorioResponse
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = null!;
        public int Capacidad { get; set; }
        public string? Equipamiento { get; set; }
        public string? Descripcion { get; set; }
        public string? Imagen { get; set; }
        public string Ubicacion { get; set; } = null!;
        public string Estado { get; set; } = null!;
        public string RowVersion { get; set; } = null!;
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
        public bool IsDeleted { get; set; }
    }
}
