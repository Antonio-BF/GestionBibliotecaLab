using GestionBibliotecaLab.Aplicacion.Dtos.Prestamo;
using GestionBibliotecaLab.Aplicacion.Excepciones;
using GestionBibliotecaLab.Aplicacion.Interfaces;
using GestionBibliotecaLab.Aplicacion.Validaciones;
using GestionBibliotecaLab.Dominio.Entidades;
using GestionBibliotecaLab.Dominio.Enums;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace GestionBibliotecaLab.Aplicacion
{
    public class PrestamoService : IPrestamoService
    {
        private readonly AppDbContext _context;
        private readonly IPenalizacionService _penalizacionService;

        public PrestamoService(AppDbContext context, IPenalizacionService penalizacionService)
        {
            _context = context;
            _penalizacionService = penalizacionService;
        }

        public async Task<List<PrestamoResponse>> GetAllAsync()
        {
            return await _context.Prestamos.AsNoTracking()
                    .OrderByDescending(p => p.FechaPrestamo)
                    .Select(MapearAResponseExpr)
                    .ToListAsync();
        }

        public async Task<PrestamoResponse> GetByIdAsync(int id)
        {
            return await _context.Prestamos.AsNoTracking()
                    .Where(p => p.Id == id)
                    .Select(MapearAResponseExpr)
                    .FirstOrDefaultAsync()
                    ?? throw new ResourceNotFoundException($"No se encontró el préstamo con el id {id}");
        }


        public async Task<List<PrestamoResponse>> GetPorUsuarioAsync(int usuarioId)
        {
            return await _context.Prestamos.AsNoTracking()
                .Where(p => p.UsuarioId == usuarioId)
                .OrderByDescending(p => p.FechaPrestamo)
                .Select(MapearAResponseExpr)
                .ToListAsync();
        }


        public async Task<PrestamoResponse> RegistrarAsync(CreatePrestamoRequest request)
        {
            var usuario = await PrestamoReglasValidacion.ObtenerUsuarioExistenteAsync(_context, request.UsuarioId);
            var libro = await PrestamoReglasValidacion.ObtenerLibroDisponibleParaPrestamoAsync(_context, request.LibroId);

            await PrestamoReglasValidacion.ValidarSinPenalizacionesPendientesAsync(_context, usuario.Id);
            await PrestamoReglasValidacion.ValidarLimiteDePrestamosAsync(_context, usuario.Id);
            await PrestamoReglasValidacion.ValidarNoTieneElMismoLibroPrestadoAsync(_context, usuario.Id, libro.Id);

            var fechaPrestamo = DateTime.UtcNow;

            var prestamo = new Prestamo
            {
                UsuarioId = usuario.Id,
                Usuario = usuario,
                LibroId = libro.Id,
                Libro = libro,
                FechaPrestamo = fechaPrestamo,
                FechaDevolucionEsperada = fechaPrestamo.AddDays(request.DiasPlazo),
                Estado = EstadoPrestamo.Prestado.ToString()
            };

            libro.CantidadDisponible--; // Libro.RowVersion protege contra condiciones de carrera

            _context.Prestamos.Add(prestamo);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new ConflictException("El libro fue modificado por otra operación. Vuelve a intentarlo.");
            }

            return PrestamoMapperCompilado(prestamo);
        }

        public async Task<PrestamoResponse> DevolverAsync(int id)
        {
            var prestamo = await _context.Prestamos
                .Include(p => p.Libro).Include(p => p.Usuario)
                .FirstOrDefaultAsync(p => p.Id == id)
                ?? throw new ResourceNotFoundException($"No se encontró el préstamo con el id {id}");

            PrestamoReglasValidacion.ValidarPuedeDevolver(prestamo);

            var fechaDevolucion = DateTime.UtcNow;
            var fueTardio = fechaDevolucion > prestamo.FechaDevolucionEsperada;

            prestamo.FechaDevolucionReal = fechaDevolucion;
            prestamo.Estado = EstadoPrestamo.Devuelto.ToString();
            prestamo.Libro.CantidadDisponible =
                Math.Min(prestamo.Libro.CantidadDisponible + 1, prestamo.Libro.CantidadTotal);

            await _context.SaveChangesAsync();

            if (fueTardio)
                await _penalizacionService.GenerarPorDevolucionTardiaAsync(prestamo.Id, prestamo.UsuarioId);

            return PrestamoMapperCompilado(prestamo);
        }

        public async Task<PrestamoResponse> RenovarAsync(int id, RenovarPrestamoRequest request)
        {
            var prestamo = await _context.Prestamos
                .Include(p => p.Libro).Include(p => p.Usuario)
                .FirstOrDefaultAsync(p => p.Id == id)
                ?? throw new ResourceNotFoundException($"No se encontró el préstamo con el id {id}");

            PrestamoReglasValidacion.ValidarPuedeRenovar(prestamo);

            prestamo.FechaDevolucionEsperada = prestamo.FechaDevolucionEsperada.AddDays(request.DiasAdicionales);
            await _context.SaveChangesAsync();

            return PrestamoMapperCompilado(prestamo);
        }

        // ---------------- Mapeo ----------------
        private static readonly Expression<Func<Prestamo, PrestamoResponse>> MapearAResponseExpr = p => new PrestamoResponse
        {
            Id = p.Id,
            UsuarioId = p.UsuarioId,
            NombreUsuario = p.Usuario.Nombres + " " + p.Usuario.Apellidos,
            LibroId = p.LibroId,
            TituloLibro = p.Libro.Titulo,
            FechaPrestamo = p.FechaPrestamo,
            FechaDevolucionEsperada = p.FechaDevolucionEsperada,
            FechaDevolucionReal = p.FechaDevolucionReal,
            Estado = p.Estado
        };

        private static readonly Func<Prestamo, PrestamoResponse> PrestamoMapperCompilado = MapearAResponseExpr.Compile();

    }
}
