namespace GestionBibliotecaLab.Aplicacion.Dtos.Categoria
{
    public class CategoriaResponse
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
    }
}
