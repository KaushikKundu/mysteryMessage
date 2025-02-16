import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerifiedEmail";

export async function POST(request: Request){
    await dbConnect();
    // db connect, take data from req obj, check if it exists, then return 
    try{
        const {username , email, password} = await request.json();
        const existingUserByUsername = await UserModel.findOne({username, isVerified: true});

        if(existingUserByUsername){
            return Response.json({
                success: false,
                message: "Username already exists"
            },
            { status: 400})
        }
        const existingUserByEmail = await UserModel.findOne({email});
        let verifyCode = Math.floor(100000 + Math.random() * 100000).toString();

        if(existingUserByEmail ){
            if(existingUserByEmail.isVerified){
                return Response.json(
                    {
                        success:false,
                        message: "user already exists with this email"                
                    },
                    {status: 400}
                )
            }else {
                const hashedPassword = await bcrypt.hash(password,10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 36000000);
                await existingUserByEmail.save();
            }
        } else {
            const hashedPassword = await bcrypt.hash(password,10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            });
            await newUser.save();
        }
        const emailResponse = await sendVerificationEmail(email,username,verifyCode);
        if(!emailResponse.success){
            return Response.json(
                {
                    success: false,
                    message: emailResponse.message
                },
                {status: 500}
            )
        }
        return Response.json({
            success: true,
            message: "User created successfully, please check your email for verification"
        },
        {status: 201});

    }catch(error){
        console.error("Error creating user", error);
        return Response.json(
            {
                success: false,
                message: "Failed to create user"
            },
            {status: 500}
        )
    }
}