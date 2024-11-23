# TinoGPT

We built a website for students to easily be able to create and access course resources. Students often have their own private group chats where they share resources they found useful, or teachers may post different resources for the same course that other students with different teachers may not have access to. This website aims to centralize where students share and access helpful materials, while also allowing teachers to post helpful resources of their own to all students, not just those in their class.

## Video Link

[Watch the video here](https://drive.google.com/file/d/10n7jYHTiGd9b-EYhjcy65Juiu8bloKxU/view?usp=sharing)

## Tech Stack

- **Frontend**: Next.js, Shadcn, Clerk for authentication
- **Backend**: Flask, MongoDB
- **Chatbot**: Botpress, BeautifulSoup

## Features

1. **User Authentication**  
   Users will sign-in with a `student.fuhsd.org` (student) or a `fuhsd.org` email (teacher). We parse the domain to verify whether they are a student or teacher and automatically give users different permissions based on their role. Emails without a `fuhsd.org` domain are prompted to sign in with an appropriate email.

2. **Course Dashboard**  
   Students and teachers may visit the dashboard to join and leave courses. Users can join any course available on the website. When a teacher joins a course, their name is automatically displayed in the course card. All users may open a course once they have joined it.

3. **Resource Sharing**  
   After joining and opening a course, users may view and like resources from students and teachers alike. Teachers and students can post student resources, however, only teachers may post teacher resources; teacher resources are prioritized and shown at the top. (Student resources are those made by students, while teacher resources are those made by teachers).

4. **Resources Page**  
   In the Resources page, users may view the resources they've created and the ones they have starred. Users may also delete their resources in this page.

5. **TinoGPT Chatbot**  
   When a user is authorized, they have access to TinoGPT, our Botpress AI chatbot (uses GPT-4). We used BeautifulSoup to scrape both [https://chs.fuhsd.org/](https://chs.fuhsd.org/) and [https://tinoclubs.com/](https://tinoclubs.com/) and fed it into the agent's knowledge base. Users may ask the AI assistant any questions about the school.

All features mentioned here are shown in the video.

