'use strict'

const CREATE_INITIAL_DATA = JSON.parse(
  process.env.CREATE_INITIAL_DATA.toLowerCase()
)

const deleteItems = async (strapi, api) => {
  const apiString = 'api::' + api + '.' + api
  const items = await strapi.entityService.findMany(apiString, {})
  for (const item of items) {
    const deletedItem = await strapi.entityService.delete(apiString, item.id)
    strapi.log.debug('deleting ' + api + ': ' + deletedItem.id)
  }
}

const createGrades = async (strapi, gradesJson) => {
  for (const grade of gradesJson) {
    strapi.log.debug('creating grade: ' + grade.name)
    const entry = await strapi.entityService.create('api::grade.grade', {
      data: {
        name: grade.name,
      },
    })
  }
}

const createSubjects = async (strapi, subjectsJson) => {
  for (const subject of subjectsJson) {
    strapi.log.debug('creating subject: ' + subject.short)
    const entry = await strapi.entityService.create('api::subject.subject', {
      data: {
        shortName: subject.short,
        longName: subject.long,
      },
    })
  }
}

const createStudents = async (strapi, studentsJson) => {
  for (const student of studentsJson) {
    const grade = await strapi.entityService.findMany('api::grade.grade', {
      filters: { name: student.grade },
    })

    if (grade.length > 0) {
      strapi.log.debug(
        'creating student: ' +
          student.lastName +
          ', ' +
          student.firstName +
          ', ' +
          grade[0].name
      )
      const entry = await strapi.entityService.create('api::student.student', {
        data: {
          firstName: student.firstName,
          lastName: student.lastName,
          grade: grade[0].id,
        },
      })
    } else {
      strapi.log.error('no matching grade found.')
    }
  }
}

const createRoles = async (strapi) => {
  const roles = await strapi.plugins['users-permissions'].services.role.find()

  const roleNames = roles.map((role) => {
    return role.name
  })

  if (!roleNames.includes('School')) {
    await strapi.plugins['users-permissions'].services.role.createRole({
      name: 'School',
      description: 'A school user.',
    })
  }

  if (!roleNames.includes('Teacher')) {
    await strapi.plugins['users-permissions'].services.role.createRole({
      name: 'Teacher',
      description: 'A Teacher user.',
    })
  }

  if (!roleNames.includes('Admin')) {
    await strapi.plugins['users-permissions'].services.role.createRole({
      name: 'Admin',
      description: 'A Admin user.',
    })
  }
}

module.exports = {
  register({ strapi }) {},

  async bootstrap({ strapi }) {
    await createRoles(strapi)

    if (CREATE_INITIAL_DATA) {
      const path = require('node:path')
      const jsonPath = path.join(process.cwd(), 'data', 'json')
      const gradesPath = path.join(jsonPath, 'grades.json')
      const subjectsPath = path.join(jsonPath, 'subjects.json')
      const studentsPath = path.join(jsonPath, 'students.json')

      const gradesJson = require(gradesPath)
      const subjectsJson = require(subjectsPath)
      const studentsJson = require(studentsPath)

      await deleteItems(strapi, 'grade')
      await deleteItems(strapi, 'subject')
      await deleteItems(strapi, 'student')

      await createGrades(strapi, gradesJson)
      await createSubjects(strapi, subjectsJson)
      await createStudents(strapi, studentsJson)
    }
  },
}
