students_anonymised.csv — data notes

* One row per student x subject. student_pseudo_id is randomly assigned
  within each (school, grade) and carries no trace of real roll numbers.
* Known limitation: in some multi-section schools, two or more children
  shared a school+grade+roll number in the source data (about 1,050 such
  keys across ~220 schools). These children appear under a SINGLE
  student_pseudo_id, so a pseudo-student can carry more than one score
  for the same subject. The source has no section column, so these
  records cannot be reliably separated.
* The official assessed-student count (28,079) counts such merged
  records once.
