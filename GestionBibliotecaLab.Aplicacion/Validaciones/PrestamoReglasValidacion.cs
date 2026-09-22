using GestionBibliotecaLab.Aplicacion.Excepciones;
using GestionBibliotecaLab.Aplicacion.Queries;
using GestionBibliotecaLab.Dominio.Entidades;
using GestionBibliotecaLab.Dominio.Enums;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionBibliotecaLab.Aplicacion.Validaciones
{
    /// <summary>
    /// Reglas de negocio y validaciones del módulo de Préstamos
    /// </summary>
    internal static class PrestamoReglasValidacion
    {
       
        public const int LimitePrestamosActivosPorUsuario = 5;

        public static async Task<Usuario> ObtenerUsuarioExistenteAsync(AppDbContext context, int usuarioId) =>
            await context.Usuarios.FirstOrDefaultAsync(u => u.Id == usuarioId)
                ?? throw new ResourceNotFoundException($"No se encontró el usuario con el id {usuarioId}");

        public static async Task<Libro> ObtenerLibroDisponibleParaPrestamoAsync(AppDbContext context, int libroId)
        {
            var libro = await context.Libros.FirstOrDefaultAsync(l => l.Id == libroId)
                ?? throw new ResourceNotFoundException($"No se encontró el libro con el id {libroId}");

            if (libro.Estado != EstadoLibro.Activo.ToString())
                throw new ConflictException("El libro no está activo para préstamo.");

            if (libro.CantidadDisponible <= 0)
                throw new ConflictException("No hay ejemplares disponibles de este libro.");

            return libro;
        }

        public static async Task ValidarSinPenalizacionesPendientesAsync(AppDbContext context, int usuarioId)
        {
            if (await EstadosActivosQueries.UsuarioTienePenalizacionesPendientesAsync(context, usuarioId))
                throw new ConflictException("El usuario tiene penalizaciones pendientes y no puede solicitar nuevos préstamos.");
        }

        public static async Task ValidarLimiteDePrestamosAsync(AppDbContext context, int usuarioId)
        {
            var activos = await EstadosActivosQueries.ContarPrestamosActivosAsync(context, usuarioId);
            if (activos >= LimitePrestamosActivosPorUsuario)
                throw new ConflictException(
                    $"El usuario alcanzó el límite de {LimitePrestamosActivosPorUsuario} libros prestados simultáneamente.");
        }

        public static async Task ValidarNoTieneElMismoLibroPrestadoAsync(AppDbContext context, int usuarioId, int libroId)
        {
            if (await EstadosActivosQueries.UsuarioTienePrestamoActivoDeLibroAsync(context, usuarioId, libroId))
                throw new ConflictException("El usuario ya tiene un ejemplar de este libro prestado.");
        }

        public static void ValidarPuedeDevolver(Prestamo prestamo)
        {
            if (prestamo.Estado == EstadoPrestamo.Devuelto.ToString())
                throw new ConflictException("El préstamo ya fue devuelto.");
        }

        public static void ValidarPuedeRenovar(Prestamo prestamo)
        {
            if (prestamo.Estado != EstadoPrestamo.Prestado.ToString())
                throw new ConflictException("Solo se pueden renovar préstamos vigentes (no vencidos ni devueltos).");
        }
    }
}
