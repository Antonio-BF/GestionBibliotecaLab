using GestionBibliotecaLab.Aplicacion.Excepciones;
using GestionBibliotecaLab.Aplicacion.Interfaces;

namespace GestionBibliotecaLab.Presentacion.API.Utils
{
    public class FileStorageService : IFileStorageService
    {
        private readonly IWebHostEnvironment _env;
        private static readonly string[] ExtensionesPermitidas = { ".jpg", ".jpeg", ".png", ".webp" };
        private const long TamanioMaximoBytes = 3 * 1024 * 1024; // 3 MB

        public FileStorageService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<string> GuardarAsync(Stream contenido, string nombreArchivoOriginal, string subcarpeta)
        {
            var extension = Path.GetExtension(nombreArchivoOriginal).ToLowerInvariant();

            if (!ExtensionesPermitidas.Contains(extension))
                throw new ValidationException("Formato de imagen no permitido. Use jpg, jpeg, png o webp.");

            if (contenido.Length > TamanioMaximoBytes)
                throw new ValidationException("La imagen supera el tamaño máximo permitido (3 MB).");

            var nombreUnico = $"{Guid.NewGuid()}{extension}";
            var carpetaFisica = Path.Combine(_env.WebRootPath, "uploads", subcarpeta);
            Directory.CreateDirectory(carpetaFisica);

            var rutaFisica = Path.Combine(carpetaFisica, nombreUnico);

            await using var destino = File.Create(rutaFisica);
            await contenido.CopyToAsync(destino);

            return $"/uploads/{subcarpeta}/{nombreUnico}";
        }
        public void Eliminar(string? rutaRelativa)
        {
            if (string.IsNullOrWhiteSpace(rutaRelativa)) return;

            var rutaFisica = Path.Combine(_env.WebRootPath, rutaRelativa.TrimStart('/'));
            if (File.Exists(rutaFisica))
                File.Delete(rutaFisica);
        }

    }
}
