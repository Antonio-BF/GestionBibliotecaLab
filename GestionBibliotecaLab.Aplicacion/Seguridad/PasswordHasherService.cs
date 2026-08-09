using GestionBibliotecaLab.Aplicacion.Interfaces;

namespace GestionBibliotecaLab.Aplicacion.Seguridad
{
    public class PasswordHasherService : IPasswordHasherService
    {
        private const int WorkFactor = 12;

        public string HashPassword(string password)
            => BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);

        public bool VerifyPassword(string hash, string password)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, hash);
            }
            catch (BCrypt.Net.SaltParseException)
            {
                return false;
            }
        }
    }
}
