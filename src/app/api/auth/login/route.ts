import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function POST(request: Request)
{
  try
  {
    const requestBody = await request.json();
    if(!requestBody)
    {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill the form",
          errors: {
            general: 'No Data provided in request body'
          }
        },
        { status: 400 }
      );
    }

    const { email, password } = requestBody;

    const errors: Record<string, string> = {};

    if(!email)
    {
      errors.email = 'Email is required';
    } else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    {
      errors.email = 'Email is invalid';
    }

    if(!password)
    {
      errors.password = 'Password is required';
    }

    if(Object.keys(errors).length > 0)
    {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill the form",
          errors
        },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if(!user)
    {
      return NextResponse.json(
        {
          success: false,
          message: "Failed Authentification",
          errors: {
            email: 'No such account with this email'
          }
        },
        { status: 401 },
      );
    }

    if (user.password!==password)
    {
      return NextResponse.json(
        {
          success: false,
          message: "Failed Authentification",
          errors: {
            password: "Password doesn't match",
          }
        },
        { status: 401 }
      );
    }

    const { password: _, ...safeUser } = user;
    return NextResponse.json({
      success: true,
      user: safeUser
    });

  }
  catch(error)
  {
    console.error("Login Error", error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal Server Error',
        errors: {
          general: 'Unexpected error occurred'
        }
      },
      {status: 500}
    );
  }
}