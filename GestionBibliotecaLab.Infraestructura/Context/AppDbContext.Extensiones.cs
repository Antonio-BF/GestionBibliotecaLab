using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace GestionBibliotecaLab.Infraestructura.Context
{
    public partial class AppDbContext
    {
        /// <summary>
        /// Implementación del hook parcial que el scaffold genera vacío. Se ejecuta al
        /// final de OnModelCreating, después de que EF ya configuró todas las relaciones
        /// e índices leídos desde la base de datos.
        /// </summary>
        partial void OnModelCreatingPartial(ModelBuilder modelBuilder)
        {
            AplicarFiltroGlobalDeSoftDelete(modelBuilder);
        }

        /// <summary>
        /// Registra HasQueryFilter(IsDeleted == false) para toda entidad que tenga una
        /// propiedad "IsDeleted" de tipo bool. A diferencia de la versión Code-First
        /// (que usaba EntidadBase), aquí no hay un tipo común del que partir: se
        /// pregunta a los metadatos del modelo de EF, no al sistema de tipos de C#.
        /// </summary>
        private static void AplicarFiltroGlobalDeSoftDelete(ModelBuilder modelBuilder)
        {
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                var propiedadIsDeleted = entityType.FindProperty("IsDeleted");
                if (propiedadIsDeleted is null || propiedadIsDeleted.ClrType != typeof(bool))
                {
                    continue;
                }

                var parametro = Expression.Parameter(entityType.ClrType, "entidad");
                var propiedad = Expression.Property(parametro, "IsDeleted");
                var condicion = Expression.Equal(propiedad, Expression.Constant(false));
                var lambda = Expression.Lambda(condicion, parametro);

                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
            }
        }

        public override int SaveChanges()
        {
            AplicarConvencionesDeAuditoriaYSoftDelete();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            AplicarConvencionesDeAuditoriaYSoftDelete();
            return base.SaveChangesAsync(cancellationToken);
        }

       
        private void AplicarConvencionesDeAuditoriaYSoftDelete()
        {
            foreach (var entry in ChangeTracker.Entries())
            {
                var tieneIsDeleted = entry.Metadata.FindProperty("IsDeleted") is not null;
                var tieneFechaCreacion = entry.Metadata.FindProperty("FechaCreacion") is not null;
                var tieneFechaActualizacion = entry.Metadata.FindProperty("FechaActualizacion") is not null;

                switch (entry.State)
                {
                    case EntityState.Added when tieneFechaCreacion:
                        entry.Property("FechaCreacion").CurrentValue = DateTime.UtcNow;
                        break;

                    case EntityState.Modified when tieneFechaActualizacion:
                        entry.Property("FechaActualizacion").CurrentValue = DateTime.UtcNow;
                        break;

                    case EntityState.Deleted when tieneIsDeleted:
                        entry.State = EntityState.Modified;
                        entry.Property("IsDeleted").CurrentValue = true;
                        if (tieneFechaActualizacion)
                        {
                            entry.Property("FechaActualizacion").CurrentValue = DateTime.UtcNow;
                        }
                        break;
                }
            }
        }
    }
}
