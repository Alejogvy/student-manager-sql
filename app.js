const db = require("./db")
const prompt = require("prompt-sync")()

// Add
function addStudent(){
  let name = prompt("Name: ")
  let lastName = prompt("Last Name: ")
  let age = prompt("Age: ")
  let course = prompt("Course: ")
  let parallel = prompt("Parallel: ")

  db.run(
    "INSERT INTO students (name, lastName, age, course, parallel) VALUES (?, ?, ?, ?, ?)",
    [name, lastName, age, course, parallel],
    function(err){
      if(err){
        console.log("Error:", err.message)
      } else {
        console.log("✅ Student added (ID:", this.lastID, ")")
      }
    }
  )
}

// List
function showStudents(){
  db.all("SELECT * FROM students", [], (err, rows)=>{
    if(err){
      return console.log(err.message)
    }

    console.log("\nStudents:")
    rows.forEach(s => {
      console.log(`${s.id} - ${s.name} ${s.lastName} ${s.age} ${s.course} ${s.parallel}`)
    })
  })
}

// Delete
function deleteStudent(){
  let id = prompt("Enter ID to delete: ")

  db.run(
    "DELETE FROM students WHERE id = ?",
    [id],
    function(err){
      if(err){
        console.log(err.message)
      } else {
        console.log("Deleted:", this.changes)
      }
    }
  )
}

// Update
function updateStudent(){
  let id = prompt("ID to update: ")

  let name = prompt("New name (leave empty to skip): ")
  let lastName = prompt("New last name (leave empty): ")
  let age = prompt("New age (leave empty): ")
  let course = prompt("New course (leave empty): ")
  let parallel = prompt("New parallel (leave empty): ")

  let fields = []
  let values = []

  if(name){
    fields.push("name = ?")
    values.push(name)
  }

  if(lastName){
    fields.push("lastName = ?")
    values.push(lastName)
  }

  if(age){
    fields.push("age = ?")
    values.push(age)
  }

  if(course){
    fields.push("course = ?")
    values.push(course)
  }

  if(parallel){
    fields.push("parallel = ?")
    values.push(parallel)
  }

  if(fields.length === 0){
    console.log("Nothing to update")
    return
  }

  let sql = `UPDATE students SET ${fields.join(", ")} WHERE id = ?`
  values.push(id)

  db.run(sql, values, function(err){
    if(err){
      console.log(err.message)
    } else {
      console.log("Updated:", this.changes)
    }
  })
}

// Add Subject
function addSubject(){
  let studentId = prompt("Student ID: ")
  let subject = prompt("Subject name: ")

  db.run(
    "INSERT INTO subjects (student_id, name) VALUES (?, ?)",
    [studentId, subject],
    function(err){
      if(err){
        console.log(err.message)
      } else {
        console.log("Subject added (ID:", this.lastID, ")")
      }
    }
  )
}

// Add Grade
function addGrade(){
  let subjectId = prompt("Subject ID: ")
  let grade = prompt("Grade: ")

  db.run(
    "INSERT INTO grades (subject_id, grade) VALUES (?, ?)",
    [subjectId, grade],
    function(err){
      if(err){
        console.log(err.message)
      } else {
        console.log("Grade added")
      }
    }
  )
}

// Average Subject
function averageBySubject(){
  let subjectId = prompt("Subject ID: ")

  db.get(
    "SELECT AVG(grade) as avg FROM grades WHERE subject_id = ?",
    [subjectId],
    (err, row)=>{
      if(err){
        return console.log(err.message)
      }

      console.log("Average:", row.avg ? row.avg.toFixed(2) : "No grades")
    }
  )
}

// Average Student
function averageByStudent(){
  let studentId = prompt("Student ID: ")

  db.get(`
    SELECT AVG(grades.grade) as avg
    FROM students
    JOIN subjects ON students.id = subjects.student_id
    JOIN grades ON subjects.id = grades.subject_id
    WHERE students.id = ?
  `, [studentId], (err, row)=>{
    if(err){
      return console.log(err.message)
    }

    console.log("🎓 Student Average:", row.avg ? row.avg.toFixed(2) : "No grades")
  })
}

// Delete Subject
function deleteSubject(){
  let subjectId = prompt("Subject ID to delete: ")

  // primero borrar notas
  db.run("DELETE FROM grades WHERE subject_id = ?", [subjectId])

  // luego borrar materia
  db.run(
    "DELETE FROM subjects WHERE id = ?",
    [subjectId],
    function(err){
      if(err){
        console.log(err.message)
      } else {
        console.log("Subject deleted:", this.changes)
      }
    }
  )
}

// Delete Grade
function deleteGrade(){
  let gradeId = prompt("Grade ID to delete: ")

  db.run(
    "DELETE FROM grades WHERE id = ?",
    [gradeId],
    function(err){
      if(err){
        console.log(err.message)
      } else {
        console.log("Grade deleted:", this.changes)
      }
    }
  )
}

// Show Subjects
function showSubjects(){
  db.all("SELECT * FROM subjects", [], (err, rows)=>{
    console.log("\nSubjects:")
    rows.forEach(s=>{
      console.log(`${s.id} - StudentID: ${s.student_id} - ${s.name}`)
    })
  })
}

// Show Grades
function showGrades(){
  db.all("SELECT * FROM grades", [], (err, rows)=>{
    console.log("\nGrades:")
    rows.forEach(g=>{
      console.log(`${g.id} - SubjectID: ${g.subject_id} - ${g.grade}`)
    })
  })
}

// Show Data (JOIN)
function showFullData(){
  db.all(`
    SELECT 
      students.name as student,
      subjects.name as subject,
      grades.grade
    FROM students
    LEFT JOIN subjects ON students.id = subjects.student_id
    LEFT JOIN grades ON subjects.id = grades.subject_id
  `, [], (err, rows)=>{
    if(err){
      return console.log(err.message)
    }

    console.log("\nFULL DATA:")

    if(rows.length === 0){
      console.log("No data available")
      return
    }

    rows.forEach(r=>{
      console.log(`${r.student || "No student"} - ${r.subject || "No subject"} - ${r.grade || "No grade"}`)
    })
  })
}

// Show View
function showSystemView(){
  db.all(`
    SELECT 
      students.id as studentId,
      students.name,
      students.lastName,
      students.course,
      students.parallel,
      subjects.id as subjectId,
      subjects.name as subject,
      grades.grade
    FROM students
    LEFT JOIN subjects ON students.id = subjects.student_id
    LEFT JOIN grades ON subjects.id = grades.subject_id
    ORDER BY students.id
  `, [], (err, rows)=>{
    if(err){
      return console.log(err.message)
    }

    let result = {}

    // Groud Data
    rows.forEach(r=>{
      if(!result[r.studentId]){
        result[r.studentId] = {
          name: r.name,
          lastName: r.lastName,
          course: r.course,
          parallel: r.parallel,
          subjects: {}
        }
      }

      if(r.subject){
        if(!result[r.studentId].subjects[r.subject]){
          result[r.studentId].subjects[r.subject] = []
        }

        if(r.grade !== null){
          result[r.studentId].subjects[r.subject].push(r.grade)
        }
      }
    })

    console.log("\n===== SCHOOL SYSTEM VIEW =====\n")

    // Print
    Object.values(result).forEach(student=>{
      console.log(`${student.name} ${student.lastName} (${student.course} ${student.parallel})`)

      let subjects = student.subjects

      if(Object.keys(subjects).length === 0){
        console.log("No subjects\n")
      } else {
        Object.keys(subjects).forEach(sub=>{
          let grades = subjects[sub]

          let avg = grades.length > 0
            ? (grades.reduce((a,b)=>a+b,0) / grades.length).toFixed(2)
            : "0"

          console.log(`${sub} → [${grades.join(", ")}] | Avg: ${avg}`)
        })
        console.log("")
      }
    })
  })
}

// Menu
function menu(){
  while(true){
    console.log("\n=== STUDENT MANAGER SQL ===")
    console.log("1. Add Student")
    console.log("2. Show Students")
    console.log("3. Delete Student")
    console.log("4. Update Student")
    console.log("5. Add Subject")
    console.log("6. Show Subjects")
    console.log("7. Average by Subject")
    console.log("8. Delete Subject")
    console.log("9. Add Grade")
    console.log("10. Show Grades")
    console.log("11. Average by Student")
    console.log("12. Delete Grade")
    console.log("13. Show Full Data")
    console.log("14. System View")
    console.log("15. Exit")

    let option = prompt("Choose option: ")

    switch(option){
      case "1":
        addStudent()
        break
      case "2":
        showStudents()
        console.log("Goodbye")
        return
      case "3":
        deleteStudent()
        break
      case "4":
        updateStudent()
        break
      case "5":
        addSubject()
        break
      case "6":
        showSubjects()
        console.log("Goodbye")
        return
      case "7":
        averageBySubject()
        break
      case "8":
        deleteSubject()
        break
      case "9":
        addGrade()
        break
      case "10":
        showGrades()
        console.log("Goodbye")
        return
      case "11":
        averageByStudent()
        break
      case "12":
        deleteGrade()
        break
      case "13":
        showFullData()
        console.log("Goodbye")
        return
      case "14":
        showSystemView()
        console.log("Goodbye")
        return
      case "15":
        console.log("Goodbye")
        return
      default:
        console.log("Invalid option")
    }
  }
}


menu()