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


-- =====================================================================
-- 19. Libros adicionales
-- =====================================================================

INSERT INTO dbo.Libros (Titulo, Autor, ISBN, Editorial, AnioPublicacion, CategoriaId, Portada, Descripcion, CantidadTotal, CantidadDisponible, Estado)
VALUES
-- Ingeniería de Software
('Code Complete', 'Steve McConnell', '9780735619678', 'Microsoft Press', 2004, 1, 'portada_code_complete.jpg', 'Guía práctica para construir software de alta calidad y mejorar las técnicas de programación.', 5, 5, 'Activo'),
('The Mythical Man-Month', 'Frederick P. Brooks Jr.', '9780201835953', 'Addison-Wesley Professional', 1995, 1, 'portada_mythical_man_month.jpg', 'Ensayos clásicos sobre ingeniería de software, productividad y gestión de proyectos.', 4, 4, 'Activo'),
('Working Effectively with Legacy Code', 'Michael C. Feathers', '9780131177055', 'Prentice Hall', 2004, 1, 'portada_legacy_code.jpg', 'Técnicas para comprender, probar y modificar sistemas de software existentes.', 3, 3, 'Activo'),
('Domain-Driven Design', 'Eric Evans', '9780321125217', 'Addison-Wesley Professional', 2003, 1, 'portada_ddd.jpg', 'Introducción al diseño dirigido por dominio para sistemas de software complejos.', 4, 4, 'Activo'),
('Continuous Delivery', 'Jez Humble y David Farley', '9780321601919', 'Addison-Wesley Professional', 2010, 1, 'portada_continuous_delivery.jpg', 'Prácticas para automatizar y mejorar la entrega de software.', 3, 3, 'Activo'),
('Effective Java', 'Joshua Bloch', '9780134685991', 'Addison-Wesley Professional', 2018, 1, 'portada_effective_java.jpg', 'Buenas prácticas y patrones para desarrollar aplicaciones Java robustas.', 6, 6, 'Activo'),
('Head First Design Patterns', 'Eric Freeman y Elisabeth Robson', '9780596007126', 'O''Reilly Media', 2004, 1, 'portada_head_first_patterns.jpg', 'Introducción práctica y visual a los patrones de diseño de software.', 5, 5, 'Activo'),
('Software Engineering', 'Ian Sommerville', '9780133943030', 'Pearson', 2015, 1, 'portada_software_engineering.jpg', 'Fundamentos de ingeniería de software, procesos, requisitos, diseño y mantenimiento.', 4, 4, 'Activo'),
('Agile Software Development', 'Robert C. Martin', '9780135974445', 'Pearson', 2002, 1, 'portada_agile_software.jpg', 'Principios y prácticas para el desarrollo ágil de software.', 3, 3, 'Activo'),
('Extreme Programming Explained', 'Kent Beck', '9780321278654', 'Addison-Wesley Professional', 2004, 1, 'portada_xp_explained.jpg', 'Introducción a los principios y prácticas de Extreme Programming.', 4, 4, 'Activo'),

-- Ciencias de la Computación
('Algorithms', 'Robert Sedgewick y Kevin Wayne', '9780321573513', 'Addison-Wesley Professional', 2011, 2, 'portada_algorithms_sedgewick.jpg', 'Estudio de algoritmos fundamentales y estructuras de datos.', 5, 5, 'Activo'),
('The Art of Computer Programming Vol. 1', 'Donald E. Knuth', '9780201896831', 'Addison-Wesley Professional', 1997, 2, 'portada_taocp_vol1.jpg', 'Obra clásica sobre algoritmos, programación y fundamentos matemáticos.', 2, 2, 'Activo'),
('Structure and Interpretation of Computer Programs', 'Harold Abelson y Gerald Jay Sussman', '9780262510875', 'MIT Press', 1996, 2, 'portada_sicp.jpg', 'Fundamentos de programación y abstracción mediante el lenguaje Scheme.', 3, 3, 'Activo'),
('Computer Organization and Design', 'David A. Patterson y John L. Hennessy', '9780123744937', 'Morgan Kaufmann', 2008, 2, 'portada_computer_organization.jpg', 'Fundamentos de arquitectura, organización y diseño de computadores.', 4, 4, 'Activo'),
('Operating System Concepts', 'Abraham Silberschatz, Peter Baer Galvin y Greg Gagne', '9781119456339', 'Wiley', 2018, 2, 'portada_operating_systems.jpg', 'Conceptos fundamentales de sistemas operativos modernos.', 5, 5, 'Activo'),
('Modern Operating Systems', 'Andrew S. Tanenbaum y Herbert Bos', '9780133591620', 'Pearson', 2014, 2, 'portada_modern_os.jpg', 'Arquitectura y funcionamiento de los sistemas operativos modernos.', 4, 4, 'Activo'),
('Computer Architecture', 'John L. Hennessy y David A. Patterson', '9780123838728', 'Morgan Kaufmann', 2011, 2, 'portada_computer_architecture.jpg', 'Principios de arquitectura de computadores y diseño de procesadores.', 3, 3, 'Activo'),
('Introduction to the Theory of Computation', 'Michael Sipser', '9781133187790', 'Cengage Learning', 2012, 2, 'portada_theory_computation.jpg', 'Introducción a autómatas, computabilidad y complejidad computacional.', 4, 4, 'Activo'),
('Artificial Intelligence Foundations', 'Tom Taulli', '9781119555742', 'Wiley', 2019, 2, 'portada_ai_foundations.jpg', 'Conceptos fundamentales de inteligencia artificial y sus aplicaciones.', 3, 3, 'Activo'),
('Computer Science Distilled', 'Wladston Ferreira Filho', '9780997316021', 'Code Energy', 2017, 2, 'portada_cs_distilled.jpg', 'Introducción accesible a conceptos esenciales de ciencias de la computación.', 3, 3, 'Activo'),

-- Bases de Datos
('Fundamentals of Database Systems', 'Ramez Elmasri y Shamkant B. Navathe', '9780133970777', 'Pearson', 2016, 3, 'portada_fundamentals_database.jpg', 'Fundamentos del diseño, implementación y administración de bases de datos.', 6, 6, 'Activo'),
('Database Management Systems', 'Raghu Ramakrishnan y Johannes Gehrke', '9780072465631', 'McGraw-Hill', 2003, 3, 'portada_dbms.jpg', 'Conceptos y técnicas para la gestión de sistemas de bases de datos.', 4, 4, 'Activo'),
('SQL Cookbook', 'Anthony Molinaro', '9780596009762', 'O''Reilly Media', 2005, 3, 'portada_sql_cookbook.jpg', 'Recetas y soluciones prácticas para trabajar con SQL.', 5, 5, 'Activo'),
('SQL Antipatterns', 'Bill Karwin', '9781934356555', 'Pragmatic Bookshelf', 2010, 3, 'portada_sql_antipatterns.jpg', 'Identificación y prevención de errores comunes en diseño de bases de datos.', 4, 4, 'Activo'),
('Designing Data-Intensive Applications', 'Martin Kleppmann', '9781449373320', 'O''Reilly Media', 2017, 3, 'portada_data_intensive.jpg', 'Principios para diseñar aplicaciones modernas orientadas a datos.', 5, 5, 'Activo'),
('Learning SQL', 'Alan Beaulieu', '9780596520830', 'O''Reilly Media', 2009, 3, 'portada_learning_sql.jpg', 'Introducción práctica al lenguaje SQL y a la consulta de bases de datos.', 4, 4, 'Activo'),
('SQL Performance Explained', 'Markus Winand', '9783950307829', 'Winand', 2012, 3, 'portada_sql_performance.jpg', 'Optimización y análisis del rendimiento de consultas SQL.', 3, 3, 'Activo'),
('Database Internals', 'Alex Petrov', '9781492040347', 'O''Reilly Media', 2019, 3, 'portada_database_internals.jpg', 'Arquitectura interna de motores de almacenamiento y sistemas de bases de datos.', 4, 4, 'Activo'),
('Seven Databases in Seven Weeks', 'Eric Redmond y Jim R. Wilson', '9781934356920', 'Pragmatic Bookshelf', 2012, 3, 'portada_seven_databases.jpg', 'Exploración práctica de diferentes tecnologías de bases de datos.', 3, 3, 'Activo'),
('NoSQL Distilled', 'Pramod J. Sadalage y Martin Fowler', '9780321826626', 'Addison-Wesley Professional', 2012, 3, 'portada_nosql_distilled.jpg', 'Introducción a conceptos y arquitecturas de bases de datos NoSQL.', 3, 3, 'Activo'),

-- Inteligencia Artificial
('Deep Learning', 'Ian Goodfellow, Yoshua Bengio y Aaron Courville', '9780262035613', 'MIT Press', 2016, 4, 'portada_deep_learning.jpg', 'Fundamentos matemáticos y prácticos del aprendizaje profundo.', 5, 5, 'Activo'),
('Hands-On Machine Learning', 'Aurélien Géron', '9781492032649', 'O''Reilly Media', 2019, 4, 'portada_hands_on_ml.jpg', 'Aplicación práctica de técnicas de Machine Learning con Python.', 6, 6, 'Activo'),
('Pattern Recognition and Machine Learning', 'Christopher M. Bishop', '9780387310732', 'Springer', 2006, 4, 'portada_prml.jpg', 'Tratamiento probabilístico del reconocimiento de patrones y aprendizaje automático.', 3, 3, 'Activo'),
('Machine Learning', 'Tom M. Mitchell', '9780070428072', 'McGraw-Hill', 1997, 4, 'portada_machine_learning_mitchell.jpg', 'Introducción a los fundamentos del aprendizaje automático.', 4, 4, 'Activo'),
('Reinforcement Learning', 'Richard S. Sutton y Andrew G. Barto', '9780262039246', 'MIT Press', 2018, 4, 'portada_reinforcement_learning.jpg', 'Fundamentos del aprendizaje por refuerzo y sistemas de decisión.', 4, 4, 'Activo'),
('Natural Language Processing with Python', 'Steven Bird, Ewan Klein y Edward Loper', '9780596516499', 'O''Reilly Media', 2009, 4, 'portada_nlp_python.jpg', 'Procesamiento de lenguaje natural utilizando Python y NLTK.', 3, 3, 'Activo'),
('Artificial Intelligence', 'Patrick Henry Winston', '9780201533774', 'Addison-Wesley', 1992, 4, 'portada_ai_winston.jpg', 'Fundamentos clásicos de inteligencia artificial.', 2, 2, 'Activo'),
('Deep Learning with Python', 'François Chollet', '9781617294433', 'Manning', 2017, 4, 'portada_deep_learning_python.jpg', 'Introducción práctica al aprendizaje profundo con Python y Keras.', 5, 5, 'Activo'),
('Artificial Intelligence for Dummies', 'John Paul Mueller y Luca Massaron', '9781119796763', 'Wiley', 2021, 4, 'portada_ai_dummies.jpg', 'Introducción general a los conceptos y aplicaciones de inteligencia artificial.', 4, 4, 'Activo'),
('Generative Deep Learning', 'David Foster', '9781098134181', 'O''Reilly Media', 2023, 4, 'portada_generative_deep_learning.jpg', 'Técnicas de aprendizaje profundo para generación de texto, imágenes y otros contenidos.', 3, 3, 'Activo'),

-- Redes y Comunicaciones
('Data Communications and Networking', 'Behrouz A. Forouzan', '9780073376226', 'McGraw-Hill', 2012, 5, 'portada_data_communications.jpg', 'Fundamentos de comunicación de datos y redes de computadoras.', 5, 5, 'Activo'),
('Computer Networking: A Top-Down Approach', 'James Kurose y Keith Ross', '9780136681557', 'Pearson', 2021, 5, 'portada_networking_top_down.jpg', 'Introducción a redes utilizando un enfoque basado en aplicaciones.', 6, 6, 'Activo'),
('TCP/IP Illustrated Volume 1', 'W. Richard Stevens', '9780201633467', 'Addison-Wesley', 1994, 5, 'portada_tcp_ip_illustrated.jpg', 'Descripción detallada de los protocolos TCP/IP y su funcionamiento.', 3, 3, 'Activo'),
('Internetworking with TCP/IP', 'Douglas E. Comer', '9780136085300', 'Pearson', 2006, 5, 'portada_internetworking_tcpip.jpg', 'Arquitectura y funcionamiento de redes basadas en TCP/IP.', 4, 4, 'Activo'),
('Network Security Essentials', 'William Stallings', '9780134527338', 'Pearson', 2017, 5, 'portada_network_security.jpg', 'Conceptos fundamentales de seguridad de redes y comunicaciones.', 5, 5, 'Activo'),
('Cryptography and Network Security', 'William Stallings', '9780134444284', 'Pearson', 2017, 5, 'portada_cryptography_network.jpg', 'Fundamentos de criptografía, seguridad de redes y mecanismos de protección.', 4, 4, 'Activo'),
('CCNA Routing and Switching', 'Wendell Odom', '9781587147174', 'Cisco Press', 2016, 5, 'portada_ccna_routing.jpg', 'Guía para fundamentos de routing, switching y preparación para CCNA.', 5, 5, 'Activo'),
('Cisco Networking All-in-One', 'Edward Tetz', '9781119818731', 'Wiley', 2021, 5, 'portada_cisco_networking.jpg', 'Conceptos y tecnologías fundamentales de redes Cisco.', 3, 3, 'Activo'),
('Network Warrior', 'Gary A. Donahue', '9781491978864', 'O''Reilly Media', 2020, 5, 'portada_network_warrior.jpg', 'Guía práctica para administradores e ingenieros de redes.', 4, 4, 'Activo'),
('The TCP/IP Guide', 'Charles M. Kozierok', '9781593270476', 'No Starch Press', 2005, 5, 'portada_tcp_ip_guide.jpg', 'Referencia amplia sobre protocolos y tecnologías TCP/IP.', 2, 2, 'Activo');

GO

-- =====================================================================
-- 20. Laboratorios adicionales
-- =====================================================================

INSERT INTO dbo.Laboratorios (Nombre, Capacidad, Ubicacion, Equipamiento, Descripcion, Imagen, Estado)
VALUES
('Laboratorio de Programación Avanzada', 35, 'Pabellón D - Primer Piso', '35 PCs Intel Core i7, monitores Full HD, proyector, pizarra digital, acceso a Internet', 'Espacio destinado al desarrollo de proyectos avanzados de programación y desarrollo de software.', 'lab6.jpg', 'Disponible'),
('Laboratorio de Bases de Datos', 25, 'Pabellón D - Segundo Piso', '25 PCs, servidores SQL Server, PostgreSQL y MySQL, proyector', 'Laboratorio especializado en diseño, administración y optimización de bases de datos.', 'lab7.jpg', 'Disponible'),
('Laboratorio de Ciberseguridad', 30, 'Pabellón E - Primer Piso', '30 PCs, firewall, switches administrables, servidores virtualizados, herramientas de seguridad', 'Laboratorio para prácticas de seguridad informática, análisis de vulnerabilidades y redes.', 'lab8.jpg', 'Disponible'),
('Laboratorio de Ciencia de Datos', 25, 'Pabellón E - Segundo Piso', '25 PCs con GPU, servidores de análisis, Python, R, Jupyter Notebook', 'Laboratorio orientado al análisis de datos, estadística y visualización.', 'lab9.jpg', 'Disponible'),
('Laboratorio de Robótica', 20, 'Pabellón F - Primer Piso', 'Kits Arduino, Raspberry Pi, sensores, motores, robots educativos y herramientas electrónicas', 'Espacio para desarrollo de proyectos de robótica y sistemas embebidos.', 'lab10.jpg', 'Disponible'),
('Laboratorio de Desarrollo Web', 30, 'Pabellón F - Segundo Piso', '30 PCs, servidores web, proyectores, acceso a Internet y herramientas de desarrollo', 'Laboratorio destinado al desarrollo de aplicaciones web frontend y backend.', 'lab11.jpg', 'Disponible'),
('Laboratorio de Sistemas Embebidos', 18, 'Pabellón G - Primer Piso', 'Microcontroladores, Arduino, Raspberry Pi, sensores, osciloscopios y fuentes de alimentación', 'Laboratorio para programación de microcontroladores y desarrollo de sistemas embebidos.', 'lab12.jpg', 'Disponible'),
('Laboratorio de Computación Móvil', 24, 'Pabellón G - Segundo Piso', '24 PCs, dispositivos Android, tablets, dispositivos iOS y herramientas de desarrollo móvil', 'Espacio especializado en desarrollo y pruebas de aplicaciones móviles.', 'lab13.jpg', 'Disponible'),
('Laboratorio de Multimedia', 20, 'Pabellón H - Primer Piso', '20 estaciones gráficas, cámaras, micrófonos, tabletas digitalizadoras y software multimedia', 'Laboratorio para producción audiovisual, diseño gráfico y procesamiento multimedia.', 'lab14.jpg', 'Mantenimiento'),
('Laboratorio de Innovación Tecnológica', 40, 'Pabellón H - Segundo Piso', '40 PCs, proyector 4K, pantallas interactivas, impresoras 3D y kits de prototipado', 'Espacio multidisciplinario para proyectos de innovación, prototipado y tecnología.', 'lab15.jpg', 'Disponible');

GO