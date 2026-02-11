
/**
 * Servicio encargado de la gestión y creación automática de la base de datos local y usuarios de ejemplo.
 */
export const initializeDatabase = async () => {
  console.log("Iniciando verificación de base de datos SICONITCC...");
  
  const dbStatus = localStorage.getItem('siconitcc_db_initialized');
  
  if (!dbStatus) {
    console.log("Base de datos no detectada. Generando estructura y usuarios de ejemplo...");
    
    // Usuarios de ejemplo
    const exampleTeachers = [
      {
        id: '101',
        name: 'Carlos Andrés Rodríguez',
        email: 'profesor1@itcc.edu.co',
        password: 'profe123',
        role: 'teacher',
        subjects: ['Matemáticas', 'Física'],
        grades: ['601', '702'],
        isCourseDirector: true,
        directedCourse: '601'
      },
      {
        id: '102',
        name: 'María Fernanda Gómez',
        email: 'profesor2@itcc.edu.co',
        password: 'profe123',
        role: 'teacher',
        subjects: ['Lengua Castellana', 'Ética'],
        grades: ['801', '902'],
        isCourseDirector: false
      }
    ];

    const exampleStudents = [
      { id: '1001', name: 'JUAN DAVID PÉREZ', grade: '601', email: 'juan.perez@itcc.edu.co', phone: '3001234567', isPiar: true },
      { id: '1002', name: 'VALENTINA LOPEZ', grade: '601', email: 'val.lopez@itcc.edu.co', phone: '3119876543', isPiar: false },
      { id: '1003', name: 'SANTIAGO CASTELLANOS', grade: '702', email: 'sant.cast@itcc.edu.co', phone: '3205554433', isPiar: true }
    ];

    const exampleCourses = [
      { id: 'c1', grade: '601', sede: 'Bachillerato' },
      { id: 'c2', grade: '702', sede: 'Bachillerato' },
      { id: 'c3', grade: '101', sede: 'Primaria' }
    ];

    const exampleAreas = [
      { id: 'a1', name: 'Matemáticas' },
      { id: 'a2', name: 'Humanidades' }
    ];

    const exampleSubjects = [
      { id: 's1', name: 'Matemáticas', areaId: 'a1' },
      { id: 's2', name: 'Lengua Castellana', areaId: 'a2' }
    ];

    localStorage.setItem('siconitcc_registered_teachers', JSON.stringify(exampleTeachers));
    localStorage.setItem('siconitcc_students', JSON.stringify(exampleStudents));
    localStorage.setItem('siconitcc_courses', JSON.stringify(exampleCourses));
    localStorage.setItem('siconitcc_areas', JSON.stringify(exampleAreas));
    localStorage.setItem('siconitcc_subjects', JSON.stringify(exampleSubjects));
    localStorage.setItem('siconitcc_sedes', JSON.stringify(['Bachillerato', 'Primaria']));
    
    const structure = {
      Estudiantes: ["ID", "Nombre", "Grado", "Email", "PIAR"],
      Docentes: ["ID", "Nombre", "Email", "Asignaturas", "Grados"],
      Anotaciones: ["Fecha", "Estudiante", "Docente", "Tipo", "Numeral"],
      PIAR: ["Estudiante_ID", "Periodo", "Objetivos", "Ajustes"],
      Competencias: ["Estudiante", "Grado", "Informe", "Revision_Gestor"]
    };
    
    console.table(structure);
    localStorage.setItem('siconitcc_db_initialized', 'true');
    console.log("Base de datos SICONITCC y usuarios semilla generados exitosamente.");
  } else {
    console.log("Conexión con Base de Datos SICONITCC establecida.");
  }
};
