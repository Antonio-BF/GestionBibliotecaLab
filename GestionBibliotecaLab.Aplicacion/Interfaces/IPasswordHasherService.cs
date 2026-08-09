namespace GestionBibliotecaLab.Aplicacion.Interfaces
{
    public interface IPasswordHasherService
    {
        string HashPassword(string password);
        bool VerifyPassword(string hash, string password);
    }
}
