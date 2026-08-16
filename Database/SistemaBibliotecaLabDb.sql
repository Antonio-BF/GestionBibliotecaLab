-- =====================================================================
-- Sistema de Gestión de Biblioteca y Reserva de Laboratorios
-- Script de creación de base de datos — SQL Server (Diseño Completo e Inicial)
-- =====================================================================

CREATE DATABASE SistemaBibliotecaLabDb;
GO

USE SistemaBibliotecaLabDb;
GO

-- =====================================================================
-- 1. Roles
-- =====================================================================
CREATE TABLE dbo.Roles (
    Id                  INT IDENTITY(1,1)   NOT NULL,
    Nombre              NVARCHAR(50)        NOT NULL,
    Descripcion         NVARCHAR(200)       NULL,
    CONSTRAINT PK_Roles PRIMARY KEY CLUSTERED (Id)
);
GO

CREATE UNIQUE INDEX UQ_Roles_Nombre ON dbo.Roles(Nombre);
GO

-- =====================================================================
-- 2. Categorias 
-- =====================================================================
CREATE TABLE dbo.Categorias (
    Id                  INT IDENTITY(1,1)   NOT NULL,
    Nombre              NVARCHAR(100)       NOT NULL,
    Descripcion         NVARCHAR(300)       NULL,
    CONSTRAINT PK_Categorias PRIMARY KEY CLUSTERED (Id)
);
GO

CREATE UNIQUE INDEX UQ_Categorias_Nombre ON dbo.Categorias(Nombre);
GO

-- =====================================================================
-- 3. Usuarios
-- =====================================================================
CREATE TABLE dbo.Usuarios (
    Id                  INT IDENTITY(1,1)   NOT NULL,
    Nombres             NVARCHAR(100)       NOT NULL,
    Apellidos           NVARCHAR(100)       NOT NULL,
    Email               NVARCHAR(150)       NOT NULL,
    PasswordHash        NVARCHAR(MAX)       NOT NULL,
    RolId               INT                 NOT NULL,
    FechaCreacion       DATETIME2           NOT NULL CONSTRAINT DF_Usuarios_FechaCreacion DEFAULT SYSUTCDATETIME(),
    FechaActualizacion  DATETIME2           NULL,
    IsDeleted           BIT                 NOT NULL CONSTRAINT DF_Usuarios_IsDeleted DEFAULT 0,
    CONSTRAINT PK_Usuarios PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Usuarios_Roles_RolId FOREIGN KEY (RolId) REFERENCES dbo.Roles(Id)
);
GO

CREATE UNIQUE INDEX UQ_Usuarios_Email_Activos ON dbo.Usuarios(Email) WHERE IsDeleted = 0;
GO

CREATE INDEX IX_Usuarios_RolId ON dbo.Usuarios(RolId);
GO

-- =====================================================================
-- 4. Libros 
-- =====================================================================
CREATE TABLE dbo.Libros (
    Id                  INT IDENTITY(1,1)   NOT NULL,
    Titulo              NVARCHAR(250)       NOT NULL,
    Autor               NVARCHAR(150)       NOT NULL,
    ISBN                NVARCHAR(20)        NOT NULL,
    Editorial           NVARCHAR(150)       NULL,
    AnioPublicacion     SMALLINT            NULL,
    CategoriaId         INT                 NULL,
    Portada             NVARCHAR(500)       NULL,
    Descripcion         NVARCHAR(1000)      NULL,
    CantidadTotal       INT                 NOT NULL,
    CantidadDisponible  INT                 NOT NULL,
    Estado              NVARCHAR(20)        NOT NULL CONSTRAINT DF_Libros_Estado DEFAULT 'Activo',
    RowVersion          ROWVERSION          NOT NULL,
    FechaCreacion       DATETIME2           NOT NULL CONSTRAINT DF_Libros_FechaCreacion DEFAULT SYSUTCDATETIME(),
    FechaActualizacion  DATETIME2           NULL,
    IsDeleted           BIT                 NOT NULL CONSTRAINT DF_Libros_IsDeleted DEFAULT 0,
    CONSTRAINT PK_Libros PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Libros_Categorias_CategoriaId FOREIGN KEY (CategoriaId) REFERENCES dbo.Categorias(Id),
    CONSTRAINT CK_Libros_Estado CHECK (Estado IN ('Activo', 'Descontinuado')),
    CONSTRAINT CK_Libros_CantidadDisponible CHECK (CantidadDisponible >= 0 AND CantidadDisponible <= CantidadTotal),
    CONSTRAINT CK_Libros_AnioPublicacion CHECK (AnioPublicacion IS NULL OR AnioPublicacion BETWEEN 1000 AND 2100)
);
GO

CREATE UNIQUE INDEX UQ_Libros_ISBN_Activos ON dbo.Libros(ISBN) WHERE IsDeleted = 0;
GO

CREATE INDEX IX_Libros_Titulo ON dbo.Libros(Titulo);
CREATE INDEX IX_Libros_Autor ON dbo.Libros(Autor);
CREATE INDEX IX_Libros_CategoriaId ON dbo.Libros(CategoriaId);
GO

-- =====================================================================
-- 5. Prestamos
-- =====================================================================
CREATE TABLE dbo.Prestamos (
    Id                          INT IDENTITY(1,1)   NOT NULL,
    UsuarioId                   INT                 NOT NULL,
    LibroId                     INT                 NOT NULL,
    FechaPrestamo               DATETIME2           NOT NULL CONSTRAINT DF_Prestamos_FechaPrestamo DEFAULT SYSUTCDATETIME(),
    FechaDevolucionEsperada     DATETIME2           NOT NULL,
    FechaDevolucionReal         DATETIME2           NULL,
    Estado                      NVARCHAR(20)        NOT NULL CONSTRAINT DF_Prestamos_Estado DEFAULT 'Prestado',
    FechaCreacion               DATETIME2           NOT NULL CONSTRAINT DF_Prestamos_FechaCreacion DEFAULT SYSUTCDATETIME(),
    FechaActualizacion          DATETIME2           NULL,
    IsDeleted                   BIT                 NOT NULL CONSTRAINT DF_Prestamos_IsDeleted DEFAULT 0,
    CONSTRAINT PK_Prestamos PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Prestamos_Usuarios_UsuarioId FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(Id),
    CONSTRAINT FK_Prestamos_Libros_LibroId FOREIGN KEY (LibroId) REFERENCES dbo.Libros(Id),
    CONSTRAINT CK_Prestamos_Estado CHECK (Estado IN ('Prestado', 'Devuelto', 'EnMora')),
    CONSTRAINT CK_Prestamos_Fechas CHECK (FechaDevolucionEsperada > FechaPrestamo)
);
GO

CREATE INDEX IX_Prestamos_UsuarioId_Estado ON dbo.Prestamos(UsuarioId, Estado);
CREATE INDEX IX_Prestamos_LibroId ON dbo.Prestamos(LibroId);
CREATE INDEX IX_Prestamos_FechaDevolucionEsperada_Activos ON dbo.Prestamos(FechaDevolucionEsperada) WHERE Estado = 'Prestado';
GO

-- =====================================================================
-- 6. Laboratorios 
-- =====================================================================
CREATE TABLE dbo.Laboratorios (
    Id                  INT IDENTITY(1,1)   NOT NULL,
    Nombre              NVARCHAR(100)       NOT NULL,
    Capacidad           INT                 NOT NULL,
    Ubicacion           NVARCHAR(150)       NOT NULL,
    Equipamiento        NVARCHAR(500)       NULL,
    Descripcion         NVARCHAR(1000)      NULL,
    Imagen              NVARCHAR(500)       NULL,
    Estado              NVARCHAR(20)        NOT NULL CONSTRAINT DF_Laboratorios_Estado DEFAULT 'Disponible',
    RowVersion          ROWVERSION          NOT NULL,
    FechaCreacion       DATETIME2           NOT NULL CONSTRAINT DF_Laboratorios_FechaCreacion DEFAULT SYSUTCDATETIME(),
    FechaActualizacion  DATETIME2           NULL,
    IsDeleted           BIT                 NOT NULL CONSTRAINT DF_Laboratorios_IsDeleted DEFAULT 0,
    CONSTRAINT PK_Laboratorios PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT CK_Laboratorios_Estado CHECK (Estado IN ('Disponible','Mantenimiento','Inactivo')),
    CONSTRAINT CK_Laboratorios_Capacidad CHECK (Capacidad > 0)
);
GO

CREATE UNIQUE INDEX UQ_Laboratorios_Nombre_Activos ON dbo.Laboratorios(Nombre) WHERE IsDeleted = 0;
GO

-- =====================================================================
-- 7. ReservasLab
-- =====================================================================
CREATE TABLE dbo.ReservasLab (
    Id                  INT IDENTITY(1,1)   NOT NULL,
    UsuarioId           INT                 NOT NULL,
    LaboratorioId       INT                 NOT NULL,
    Fecha               DATE                NOT NULL,
    HoraInicio          TIME(0)             NOT NULL,
    HoraFin             TIME(0)             NOT NULL,
    Estado              NVARCHAR(20)        NOT NULL CONSTRAINT DF_ReservasLab_Estado DEFAULT 'Pendiente',
    FechaCreacion       DATETIME2           NOT NULL CONSTRAINT DF_ReservasLab_FechaCreacion DEFAULT SYSUTCDATETIME(),
    FechaActualizacion  DATETIME2           NULL,
    IsDeleted           BIT                 NOT NULL CONSTRAINT DF_ReservasLab_IsDeleted DEFAULT 0,
    CONSTRAINT PK_ReservasLab PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_ReservasLab_Usuarios_UsuarioId FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(Id),
    CONSTRAINT FK_ReservasLab_Laboratorios_LaboratorioId FOREIGN KEY (LaboratorioId) REFERENCES dbo.Laboratorios(Id),
    CONSTRAINT CK_ReservasLab_Estado CHECK (Estado IN ('Pendiente','Confirmada','Cancelada','Finalizada')),
    CONSTRAINT CK_ReservasLab_Horario CHECK (HoraFin > HoraInicio)
);
GO

CREATE UNIQUE INDEX UQ_ReservasLab_Horario_Activas ON dbo.ReservasLab(LaboratorioId,Fecha,HoraInicio,HoraFin) WHERE IsDeleted = 0;
GO

CREATE INDEX IX_ReservasLab_LaboratorioId_Fecha ON dbo.ReservasLab(LaboratorioId, Fecha);
CREATE INDEX IX_ReservasLab_UsuarioId ON dbo.ReservasLab(UsuarioId);
GO

-- =====================================================================
-- 8. Penalizaciones
-- =====================================================================
CREATE TABLE dbo.Penalizaciones (
    Id                  INT IDENTITY(1,1)   NOT NULL,
    UsuarioId           INT                 NOT NULL,
    PrestamoId          INT                 NULL,
    ReservaLabId        INT                 NULL,
    Tipo                NVARCHAR(30)        NOT NULL,
    Motivo              NVARCHAR(300)       NOT NULL,
    Monto               DECIMAL(10,2)       NULL,
    FechaGeneracion     DATETIME2           NOT NULL CONSTRAINT DF_Penalizaciones_FechaGeneracion DEFAULT SYSUTCDATETIME(),
    FechaResolucion     DATETIME2           NULL,
    Estado              NVARCHAR(20)        NOT NULL CONSTRAINT DF_Penalizaciones_Estado DEFAULT 'Pendiente',
    FechaCreacion       DATETIME2           NOT NULL CONSTRAINT DF_Penalizaciones_FechaCreacion DEFAULT SYSUTCDATETIME(),
    FechaActualizacion  DATETIME2           NULL,
    IsDeleted           BIT                 NOT NULL CONSTRAINT DF_Penalizaciones_IsDeleted DEFAULT 0,
    CONSTRAINT PK_Penalizaciones PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Penalizaciones_Usuarios_UsuarioId FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(Id),
    CONSTRAINT FK_Penalizaciones_Prestamos_PrestamoId FOREIGN KEY (PrestamoId) REFERENCES dbo.Prestamos(Id),
    CONSTRAINT FK_Penalizaciones_ReservasLab_ReservaLabId FOREIGN KEY (ReservaLabId) REFERENCES dbo.ReservasLab(Id),
    CONSTRAINT CK_Penalizaciones_Tipo CHECK (Tipo IN ('DevolucionTardia', 'DanioEquipo', 'Otro')),
    CONSTRAINT CK_Penalizaciones_Estado CHECK (Estado IN ('Pendiente', 'Pagada', 'Anulada')),
    CONSTRAINT CK_Penalizaciones_Origen CHECK (
        (PrestamoId IS NOT NULL AND ReservaLabId IS NULL) 
        OR (PrestamoId IS NULL AND ReservaLabId IS NOT NULL)
    )
);
GO

CREATE INDEX IX_Penalizaciones_UsuarioId_Estado ON dbo.Penalizaciones(UsuarioId, Estado);
GO

-- =====================================================================
-- 9. RefreshTokens
-- =====================================================================
CREATE TABLE dbo.RefreshTokens (
    Id                  INT IDENTITY(1,1)   NOT NULL,
    UsuarioId           INT                 NOT NULL,
    Token               NVARCHAR(200)       NOT NULL,
    FechaExpiracion     DATETIME2           NOT NULL,
    Revocado            BIT                 NOT NULL CONSTRAINT DF_RefreshTokens_Revocado DEFAULT 0,
    FechaRevocacion     DATETIME2           NULL,
    ReemplazadoPorToken NVARCHAR(200)       NULL,
    FechaCreacion       DATETIME2           NOT NULL CONSTRAINT DF_RefreshTokens_FechaCreacion DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_RefreshTokens PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_RefreshTokens_Usuarios_UsuarioId FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_RefreshTokens_Token UNIQUE (Token)
);
GO

CREATE INDEX IX_RefreshTokens_UsuarioId ON dbo.RefreshTokens(UsuarioId);
CREATE INDEX IX_RefreshTokens_FechaExpiracion ON dbo.RefreshTokens(FechaExpiracion);
GO

-- =====================================================================
-- 10. Seed data: Roles
-- =====================================================================
SET IDENTITY_INSERT dbo.Roles ON;

INSERT INTO dbo.Roles (Id, Nombre, Descripcion) VALUES
    (1, 'Administrador', 'Gestiona inventario, laboratorios, usuarios y aprobaciones.'),
    (2, 'Estudiante', 'Solicita libros, reserva laboratorios y consulta su historial.'),
    (3, 'Docente', 'Solicita libros, reserva laboratorios y consulta su historial.'),
    (4, 'Bibliotecario', 'Gestiona reservas y prestamos');

SET IDENTITY_INSERT dbo.Roles OFF;
GO

-- =====================================================================
-- 11. Seed data: Categorias
-- =====================================================================
SET IDENTITY_INSERT dbo.Categorias ON;

INSERT INTO dbo.Categorias (Id, Nombre, Descripcion) VALUES
    (1, 'Ingeniería de Software', 'Libros sobre patrones, metodologías y calidad de código.'),
    (2, 'Ciencias de la Computación', 'Algoritmos, estructuras de datos y teoría.'),
    (3, 'Bases de Datos', 'Diseño, conceptos y administración de sistemas de BD.'),
    (4, 'Inteligencia Artificial', 'Machine Learning, Deep Learning y sistemas inteligentes.'),
    (5, 'Redes y Comunicaciones', 'Protocolos, arquitectura y redes de computadoras.');

SET IDENTITY_INSERT dbo.Categorias OFF;
GO

-- =====================================================================
-- 12. Seed data: Usuarios
-- =====================================================================
INSERT INTO dbo.Usuarios (Nombres, Apellidos, Email, PasswordHash, RolId) VALUES 
('Administrador', 'Sistema', 'admin@bibliotecalab.com', '$2a$11$s1hs6IMqg9CfpjBdP70FS.L1VsqqIPh2zZ.sYbE1SR7pCKxu06z5W', 1), -- Password: Admin123!
('Juan', 'Perez', 'juan.perez@bibliotecalab.com', '$2a$11$OmYmIGGK3M5.v8OuVKooF.ialAEwCN.41NJZOji6qvxcCaYi1T4ai', 2),  -- Password: Estudiante123!
('Maria', 'Gomez', 'maria.gomez@bibliotecalab.com', '$2a$11$GGVB4SqUtoIkRTqeKVX2Wu42lYDK/EsFw11/9nbNxViaqBgsyd2Ka', 3); -- Password: Docente123!
GO

-- =====================================================================
-- 13. Seed data: Libros
-- =====================================================================
INSERT INTO dbo.Libros (Titulo, Autor, ISBN, Editorial, AnioPublicacion, CategoriaId, Portada, Descripcion, CantidadTotal, CantidadDisponible, Estado) VALUES
( 'Clean Code', 'Robert C. Martin', '9780132350884', 'Prentice Hall', 2008, 1, 'portada_cleancode.jpg', 'A Handbook of Agile Software Craftsmanship', 5, 4, 'Activo' ),
( 'The Pragmatic Programmer', 'David Thomas y Andrew Hunt', '9780135957059', 'Addison-Wesley Professional', 2019, 1, 'portada_pragmatic.jpg', 'Your journey to mastery', 3, 2, 'Activo' ),
( 'Design Patterns', 'Erich Gamma, Richard Helm, Ralph Johnson y John Vlissides', '9780201633610', 'Addison-Wesley Professional', 1994, 1, 'portada_designpatterns.jpg', 'Elements of Reusable Object-Oriented Software', 4, 4, 'Activo' ),
( 'Introduction to Algorithms', 'Thomas H. Cormen', '9780262046305', 'MIT Press', 2022, 2, 'portada_clrs.jpg', 'Comprehensive guide to algorithms', 2, 1, 'Activo' ),
( 'Database System Concepts', 'Abraham Silberschatz', '9780078022159', 'McGraw-Hill Education', 2019, 3, 'portada_dbconcepts.jpg', 'Fundamentals of database system concepts', 6, 6, 'Activo' ),
( 'Artificial Intelligence: A Modern Approach', 'Stuart Russell y Peter Norvig', '9780134610993', 'Pearson', 2020, 4, 'portada_aima.jpg', 'The comprehensive guide to AI', 2, 1, 'Activo' ),
( 'Computer Networks', 'Andrew S. Tanenbaum', '9780132126953', 'Pearson', 2010, 5, 'portada_computernetworks.jpg', 'Layered network architecture', 3, 3, 'Activo' ),
( 'Refactoring', 'Martin Fowler', '9780134757599', 'Addison-Wesley Professional', 2018, 1, 'portada_refactoring.jpg', 'Improving the Design of Existing Code', 5, 5, 'Activo' ),
( 'Legacy Programming Guide', 'Editorial Técnica', '9789999999991', 'Editorial Técnica', 2005, 1, 'portada_legacy.jpg', 'Guide to old legacy systems', 2, 2, 'Descontinuado' );
GO

-- =====================================================================
-- 14. Seed data: Laboratorios
-- =====================================================================
INSERT INTO dbo.Laboratorios (Nombre, Capacidad, Ubicacion, Equipamiento, Descripcion, Imagen, Estado) VALUES
( 'Laboratorio de Computación 1', 30, 'Pabellón A - Primer Piso', '30 PCs Intel Core i5, proyector, pizarra digital, acceso a Internet', 'Laboratorio principal para programación', 'lab1.jpg', 'Disponible' ),
( 'Laboratorio de Computación 2', 25, 'Pabellón A - Segundo Piso', '25 PCs Intel Core i7, proyector, pizarra digital, acceso a Internet', 'Laboratorio avanzado de cómputo', 'lab2.jpg', 'Disponible' ),
( 'Laboratorio de Redes', 20, 'Pabellón B - Primer Piso', '20 PCs, routers Cisco, switches administrables, racks de comunicaciones', 'Laboratorio especializado en redes', 'lab3.jpg', 'Disponible' ),
( 'Laboratorio de Inteligencia Artificial', 20, 'Pabellón B - Segundo Piso', '20 PCs con GPU, servidores de entrenamiento, proyector', 'Laboratorio enfocado en IA y procesamiento de datos', 'lab4.jpg', 'Disponible' ),
( 'Laboratorio de Electrónica', 15, 'Pabellón C - Primer Piso', 'Osciloscopios, fuentes de poder, multímetros, generadores de señales', 'Laboratorio de circuitos y hardware', 'lab5.jpg', 'Mantenimiento' );
GO

-- =====================================================================
-- 15. Seed data: Prestamos
-- =====================================================================
INSERT INTO dbo.Prestamos (UsuarioId, LibroId, FechaPrestamo, FechaDevolucionEsperada, FechaDevolucionReal, Estado) VALUES
( 2, 1, '2026-08-10 09:00:00', '2026-08-20 23:59:59', NULL, 'Prestado' ),
( 3, 2, '2026-08-11 10:30:00', '2026-08-18 23:59:59', NULL, 'Prestado' ),
( 2, 3, '2026-07-20 11:00:00', '2026-08-03 23:59:59', '2026-07-30 15:30:00', 'Devuelto' ),
( 3, 4, '2026-07-25 09:30:00', '2026-08-05 23:59:59', NULL, 'EnMora' ),
( 2, 5, '2026-07-10 14:00:00', '2026-07-24 23:59:59', '2026-07-22 16:00:00', 'Devuelto' ),
( 3, 6, '2026-08-12 08:30:00', '2026-08-25 23:59:59', NULL, 'Prestado' ),
( 1, 7, '2026-06-15 10:00:00', '2026-06-29 23:59:59', '2026-06-25 12:00:00', 'Devuelto' ),
( 2, 8, '2026-07-01 09:00:00', '2026-07-15 23:59:59', '2026-07-12 17:00:00', 'Devuelto' );
GO

-- =====================================================================
-- 16. Seed data: ReservasLab
-- =====================================================================
INSERT INTO dbo.ReservasLab (UsuarioId, LaboratorioId, Fecha, HoraInicio, HoraFin, Estado) VALUES
(2, 1, '2026-08-14', '09:00', '11:00', 'Confirmada'),
(3, 2, '2026-08-14', '14:00', '16:00', 'Pendiente'),
(2, 3, '2026-08-15', '10:00', '12:00', 'Confirmada'),
(3, 1, '2026-08-14', '11:00', '13:00', 'Pendiente'),
(2, 4, '2026-08-10', '09:00', '11:00', 'Finalizada'),
(3, 3, '2026-08-08', '15:00', '17:00', 'Cancelada'),
(1, 1, '2026-08-17', '08:00', '09:30', 'Confirmada'),
(2, 2, '2026-08-18', '16:00', '18:00', 'Pendiente');
GO

-- =====================================================================
-- 17. Seed data: Penalizaciones
-- =====================================================================
INSERT INTO dbo.Penalizaciones (UsuarioId, PrestamoId, ReservaLabId, Tipo, Motivo, Monto, FechaGeneracion, FechaResolucion, Estado) VALUES
(3, 4, NULL, 'DevolucionTardia', 'Devolución tardía del libro "Introduction to Algorithms".', 15.00, '2026-08-06 08:00:00', NULL, 'Pendiente'),
(2, NULL, 5, 'DanioEquipo', 'Daño reportado en un equipo utilizado durante la reserva del laboratorio.', 75.00, '2026-08-11 10:00:00', NULL, 'Pendiente'),
(2, 3, NULL, 'DevolucionTardia', 'Devolución tardía registrada en un préstamo anterior.', 10.00, '2026-07-31 09:00:00', '2026-08-02 14:30:00', 'Pagada'),
(3, NULL, 6, 'Otro', 'Incidencia registrada durante una reserva posteriormente anulada.', 20.00, '2026-08-09 09:00:00', '2026-08-10 11:00:00', 'Anulada');
GO

-- =====================================================================
-- 18. Procedimientos almacenados
-- =====================================================================

-- =====================================================================
-- 18.1 Verificación rápida de disponibilidad
-- =====================================================================
CREATE OR ALTER PROCEDURE dbo.sp_VerificarDisponibilidadLaboratorio
    @LaboratorioId INT,
    @Fecha DATE,
    @HoraInicio TIME(0),
    @HoraFin TIME(0)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CASE
            WHEN NOT EXISTS (
                SELECT 1
                FROM dbo.Laboratorios lab
                WHERE lab.Id = @LaboratorioId
                  AND lab.IsDeleted = 0
                  AND lab.Estado = 'Disponible'
            )
                THEN CAST(0 AS BIT)

            WHEN EXISTS (
                SELECT 1
                FROM dbo.ReservasLab r
                WHERE r.LaboratorioId = @LaboratorioId
                  AND r.Fecha = @Fecha
                  AND r.IsDeleted = 0
                  AND r.Estado IN ('Pendiente', 'Confirmada')
                  AND r.HoraInicio < @HoraFin
                  AND r.HoraFin > @HoraInicio
            )
                THEN CAST(0 AS BIT)

            ELSE CAST(1 AS BIT)
        END AS Disponible;
END
GO
-- =====================================================================
-- 18.2 Generación batch de moras por préstamos vencidos
-- =====================================================================
CREATE OR ALTER PROCEDURE dbo.sp_GenerarMorasPorPrestamosVencidos
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    CREATE TABLE #PrestamosVencidos (
        PrestamoId INT,
        UsuarioId INT
    );

    BEGIN TRANSACTION;

    UPDATE p
    SET Estado = 'EnMora',
        FechaActualizacion = SYSUTCDATETIME()
    OUTPUT 
        inserted.Id, 
        inserted.UsuarioId 
        INTO #PrestamosVencidos(PrestamoId, UsuarioId)
    FROM dbo.Prestamos p
    WHERE p.Estado = 'Prestado'
      AND p.FechaDevolucionEsperada < SYSUTCDATETIME()
      AND p.IsDeleted = 0;

    INSERT INTO dbo.Penalizaciones (
        UsuarioId, 
        PrestamoId, 
        Tipo, 
        Motivo, 
        Estado, 
        FechaGeneracion
    )
    SELECT 
        pv.UsuarioId, 
        pv.PrestamoId, 
        'DevolucionTardia',
        'Generada automáticamente por vencimiento de préstamo.',
        'Pendiente',
        SYSUTCDATETIME()
    FROM #PrestamosVencidos pv
    WHERE NOT EXISTS (
        SELECT 1 
        FROM dbo.Penalizaciones pen
        WHERE pen.PrestamoId = pv.PrestamoId 
          AND pen.Estado = 'Pendiente'
    );

    COMMIT TRANSACTION;

    DROP TABLE #PrestamosVencidos;
END
GO

-- =====================================================================
-- 18.3 Historial consolidado de un usuario
-- =====================================================================
CREATE OR ALTER PROCEDURE dbo.sp_HistorialUsuario
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        p.Id, 
        'Prestamo' AS Tipo, 
        l.Titulo AS Detalle, 
        p.FechaPrestamo AS Fecha, 
        p.Estado
    FROM dbo.Prestamos p
    JOIN dbo.Libros l 
        ON l.Id = p.LibroId
    WHERE p.UsuarioId = @UsuarioId 
      AND p.IsDeleted = 0

    UNION ALL

    SELECT 
        r.Id, 
        'ReservaLab' AS Tipo, 
        lab.Nombre AS Detalle,
        CAST(r.Fecha AS DATETIME2) AS Fecha, 
        r.Estado
    FROM dbo.ReservasLab r
    JOIN dbo.Laboratorios lab 
        ON lab.Id = r.LaboratorioId
    WHERE r.UsuarioId = @UsuarioId 
      AND r.IsDeleted = 0

    ORDER BY Fecha DESC;
END
GO

-- =====================================================================
-- 18.4 Limpieza de RefreshTokens expirados
-- =====================================================================
CREATE OR ALTER PROCEDURE dbo.sp_LimpiarRefreshTokensExpirados
    @DiasRetencion INT = 30
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.RefreshTokens
    WHERE FechaExpiracion < DATEADD(
        DAY, 
        -@DiasRetencion, 
        SYSUTCDATETIME()
    );
END
GO