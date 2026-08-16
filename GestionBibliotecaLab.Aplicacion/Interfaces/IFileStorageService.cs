namespace GestionBibliotecaLab.Aplicacion.Interfaces
{
    public interface IFileStorageService
    {
        Task<string> GuardarAsync(Stream contenido, string nombreArchivoOriginal, string subcarpeta);
        void Eliminar(string? rutaRelativa);
    }
}
