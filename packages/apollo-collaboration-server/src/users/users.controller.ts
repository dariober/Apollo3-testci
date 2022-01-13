import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common'
import { Response } from 'express'
import { getCustomRepository } from 'typeorm'

import ApolloUser from '../entity/grails_user.entity'
import { GrailsUserRepository } from '../repository/GrailsUserRepository'
import { JwtAuthGuard } from '../utils/jwt-auth.guard'
import { Roles } from '../utils/role/role.decorator'
import { Role } from '../utils/role/role.enum'
import { UsersService } from './users.service'

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get all users from database using pure ORM
   * @param response
   * @returns Return list of users with HttpResponse status 'HttpStatus.OK'
   * or in case of 'No data found' return error message with 'HttpStatus.NOT_FOUND'
   * or in case of error return error message with 'HttpStatus.INTERNAL_SERVER_ERROR'
   */
  @UseGuards(JwtAuthGuard)
  @Roles(Role.User) // This value is for demo only
  @Get('/all')
  async getAllUsersOrm(@Res() response: Response) {
    return this.usersService.getAllUsersORM(response)
  }

  /**
   * Get usernames from database using embedded SQL in customs repository
   * @param response
   * @returns Return list of usernames with HttpResponse status 'HttpStatus.OK'
   * or in case of 'No data found' return error message with 'HttpStatus.NOT_FOUND'
   * or in case of error return error message with 'HttpStatus.INTERNAL_SERVER_ERROR'
   */
  @UseGuards(JwtAuthGuard)
  @Roles() // Empty value is for demo only
  @Get('/usernames')
  async getAllUsers2(@Res() response: Response) {
    return this.usersService.getAllUsernames(response)
  }

  /**
   * Get users and their roles
   * @param response
   * @returns Return list of users and their roles with HttpResponse status 'HttpStatus.OK'
   * or in case of 'No data found' return error message with 'HttpStatus.NOT_FOUND'
   * or in case of error return error message with 'HttpStatus.INTERNAL_SERVER_ERROR'
   */
  @UseGuards(JwtAuthGuard)
  @Roles() // Empty value is for demo only
  @Get('/userandroles')
  async getAllUsersAndRoles(@Res() response: Response) {
    return this.usersService.getUsersAndRoles(response)
  }

  /**
   * Get user by lastname using customized ORM in customs repository
   * @param lastname
   * @param response
   * @returns Return user with HttpResponse status 'HttpStatus.OK'
   * or in case of 'No data found' return error message with 'HttpStatus.NOT_FOUND'
   * or in case of error return error message with 'HttpStatus.INTERNAL_SERVER_ERROR'
   */
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin) // This value is for demo only
  @Get(':lastname')
  async getByLastname(
    @Param('lastname') lastname: string,
    @Res() response: Response,
  ) {
    return getCustomRepository(GrailsUserRepository).findByLastName(
      lastname,
      response,
    )
  }

  /**
   * Adds new user to database unless the user already exist
   * @param user User object
   * @param response
   * @returns Return new user object with status 'HttpStatus.OK'
   * or in case of user already exists then return error message with 'HttpStatus.CONFLICT'
   * or in case of error return error message with 'HttpStatus.INTERNAL_SERVER_ERROR'
   */
  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Post()
  async addNewUser(@Body() user: ApolloUser, @Res() response: Response) {
    return this.usersService.addNewUserTypeORMTransaction(user, response) // Saves data using TypeORM transaction. This is working ok
    // return this.usersService.addNewUser(user, response); // Saves data using TypeScript transaction. This is working ok
  }
}