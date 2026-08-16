using System;
using System.Collections.Generic;
using GestionBibliotecaLab.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;

namespace GestionBibliotecaLab.Infraestructura.Context;

public partial class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Categoria> Categorias { get; set; }

    public virtual DbSet<Laboratorio> Laboratorios { get; set; }

    public virtual DbSet<Libro> Libros { get; set; }

    public virtual DbSet<Penalizacion> Penalizaciones { get; set; }

    public virtual DbSet<Prestamo> Prestamos { get; set; }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    public virtual DbSet<ReservaLab> ReservasLabs { get; set; }

    public virtual DbSet<Rol> Roles { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Categoria>(entity =>
        {
            entity.HasIndex(e => e.Nombre, "UQ_Categorias_Nombre").IsUnique();

            entity.Property(e => e.Descripcion).HasMaxLength(300);
            entity.Property(e => e.Nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<Laboratorio>(entity =>
        {
            entity.HasIndex(e => e.Nombre, "UQ_Laboratorios_Nombre_Activos")
                .IsUnique()
                .HasFilter("([IsDeleted]=(0))");

            entity.Property(e => e.Descripcion).HasMaxLength(1000);
            entity.Property(e => e.Equipamiento).HasMaxLength(500);
            entity.Property(e => e.Estado)
                .HasMaxLength(20)
                .HasDefaultValue("Disponible", "DF_Laboratorios_Estado");
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(sysutcdatetime())", "DF_Laboratorios_FechaCreacion");
            entity.Property(e => e.Imagen).HasMaxLength(500);
            entity.Property(e => e.Nombre).HasMaxLength(100);
            entity.Property(e => e.RowVersion)
                .IsRowVersion()
                .IsConcurrencyToken();
            entity.Property(e => e.Ubicacion).HasMaxLength(150);
        });

        modelBuilder.Entity<Libro>(entity =>
        {
            entity.HasIndex(e => e.Autor, "IX_Libros_Autor");

            entity.HasIndex(e => e.CategoriaId, "IX_Libros_CategoriaId");

            entity.HasIndex(e => e.Titulo, "IX_Libros_Titulo");

            entity.HasIndex(e => e.Isbn, "UQ_Libros_ISBN_Activos")
                .IsUnique()
                .HasFilter("([IsDeleted]=(0))");

            entity.Property(e => e.Autor).HasMaxLength(150);
            entity.Property(e => e.Descripcion).HasMaxLength(1000);
            entity.Property(e => e.Editorial).HasMaxLength(150);
            entity.Property(e => e.Estado)
                .HasMaxLength(20)
                .HasDefaultValue("Activo", "DF_Libros_Estado");
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(sysutcdatetime())", "DF_Libros_FechaCreacion");
            entity.Property(e => e.Isbn)
                .HasMaxLength(20)
                .HasColumnName("ISBN");
            entity.Property(e => e.Portada).HasMaxLength(500);
            entity.Property(e => e.RowVersion)
                .IsRowVersion()
                .IsConcurrencyToken();
            entity.Property(e => e.Titulo).HasMaxLength(250);

            entity.HasOne(d => d.Categoria).WithMany(p => p.Libros).HasForeignKey(d => d.CategoriaId);
        });

        modelBuilder.Entity<Penalizacion>(entity =>
        {
            entity.HasIndex(e => new { e.UsuarioId, e.Estado }, "IX_Penalizaciones_UsuarioId_Estado");

            entity.Property(e => e.Estado)
                .HasMaxLength(20)
                .HasDefaultValue("Pendiente", "DF_Penalizaciones_Estado");
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(sysutcdatetime())", "DF_Penalizaciones_FechaCreacion");
            entity.Property(e => e.FechaGeneracion).HasDefaultValueSql("(sysutcdatetime())", "DF_Penalizaciones_FechaGeneracion");
            entity.Property(e => e.Monto).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.Motivo).HasMaxLength(300);
            entity.Property(e => e.Tipo).HasMaxLength(30);

            entity.HasOne(d => d.Prestamo).WithMany(p => p.Penalizaciones).HasForeignKey(d => d.PrestamoId);

            entity.HasOne(d => d.ReservaLab).WithMany(p => p.Penalizaciones).HasForeignKey(d => d.ReservaLabId);

            entity.HasOne(d => d.Usuario).WithMany(p => p.Penalizaciones)
                .HasForeignKey(d => d.UsuarioId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<Prestamo>(entity =>
        {
            entity.HasIndex(e => e.FechaDevolucionEsperada, "IX_Prestamos_FechaDevolucionEsperada_Activos").HasFilter("([Estado]='Prestado')");

            entity.HasIndex(e => e.LibroId, "IX_Prestamos_LibroId");

            entity.HasIndex(e => new { e.UsuarioId, e.Estado }, "IX_Prestamos_UsuarioId_Estado");

            entity.Property(e => e.Estado)
                .HasMaxLength(20)
                .HasDefaultValue("Prestado", "DF_Prestamos_Estado");
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(sysutcdatetime())", "DF_Prestamos_FechaCreacion");
            entity.Property(e => e.FechaPrestamo).HasDefaultValueSql("(sysutcdatetime())", "DF_Prestamos_FechaPrestamo");

            entity.HasOne(d => d.Libro).WithMany(p => p.Prestamos)
                .HasForeignKey(d => d.LibroId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.Usuario).WithMany(p => p.Prestamos)
                .HasForeignKey(d => d.UsuarioId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(e => e.FechaExpiracion, "IX_RefreshTokens_FechaExpiracion");

            entity.HasIndex(e => e.UsuarioId, "IX_RefreshTokens_UsuarioId");

            entity.HasIndex(e => e.Token, "UQ_RefreshTokens_Token").IsUnique();

            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(sysutcdatetime())", "DF_RefreshTokens_FechaCreacion");
            entity.Property(e => e.ReemplazadoPorToken).HasMaxLength(200);
            entity.Property(e => e.Token).HasMaxLength(200);

            entity.HasOne(d => d.Usuario).WithMany(p => p.RefreshTokens).HasForeignKey(d => d.UsuarioId);
        });

        modelBuilder.Entity<ReservaLab>(entity =>
        {
            entity.ToTable("ReservasLab");

            entity.HasIndex(e => new { e.LaboratorioId, e.Fecha }, "IX_ReservasLab_LaboratorioId_Fecha");

            entity.HasIndex(e => e.UsuarioId, "IX_ReservasLab_UsuarioId");

            entity.HasIndex(e => new { e.LaboratorioId, e.Fecha, e.HoraInicio, e.HoraFin }, "UQ_ReservasLab_Horario_Activas")
                .IsUnique()
                .HasFilter("([IsDeleted]=(0))");

            entity.Property(e => e.Estado)
                .HasMaxLength(20)
                .HasDefaultValue("Pendiente", "DF_ReservasLab_Estado");
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(sysutcdatetime())", "DF_ReservasLab_FechaCreacion");
            entity.Property(e => e.HoraFin).HasPrecision(0);
            entity.Property(e => e.HoraInicio).HasPrecision(0);

            entity.HasOne(d => d.Laboratorio).WithMany(p => p.ReservasLabs)
                .HasForeignKey(d => d.LaboratorioId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.Usuario).WithMany(p => p.ReservasLabs)
                .HasForeignKey(d => d.UsuarioId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<Rol>(entity =>
        {
            entity.HasIndex(e => e.Nombre, "UQ_Roles_Nombre").IsUnique();

            entity.Property(e => e.Descripcion).HasMaxLength(200);
            entity.Property(e => e.Nombre).HasMaxLength(50);
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasIndex(e => e.RolId, "IX_Usuarios_RolId");

            entity.HasIndex(e => e.Email, "UQ_Usuarios_Email_Activos")
                .IsUnique()
                .HasFilter("([IsDeleted]=(0))");

            entity.Property(e => e.Apellidos).HasMaxLength(100);
            entity.Property(e => e.Email).HasMaxLength(150);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(sysutcdatetime())", "DF_Usuarios_FechaCreacion");
            entity.Property(e => e.Nombres).HasMaxLength(100);

            entity.HasOne(d => d.Rol).WithMany(p => p.Usuarios)
                .HasForeignKey(d => d.RolId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
