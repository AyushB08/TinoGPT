"use client";
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Users, Clock, BookOpen } from "lucide-react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from "@clerk/nextjs";

const CourseCard = ({ course, enrolled, onNavigate, onJoinLeave }) => {
  const teacherNames = course.teacher_names?.join(", ") || "No Teacher";

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="relative h-32">
        <Image
          src={course.image}
          alt={course.name}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader className={`${course.color} border-b py-3 px-4`}>
        <h3 className="text-base font-bold">{course.name}</h3>
        <p className="text-xs text-gray-600">{teacherNames}</p>
      </CardHeader>
      <CardContent className="py-2 px-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-600" />
          <span className="text-xs text-gray-600">{course.students?.length || 0} students</span>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 py-2 px-4">
        {enrolled ? (
          <div className="flex gap-2 w-full">
            <Button 
              variant="destructive"
              className="flex-1 text-xs py-1"
              onClick={() => onJoinLeave(course, enrolled)}
            >
              Leave Course
            </Button>
            <Button 
              variant="outline"
              className="flex-1 text-xs py-1"
              onClick={() => onNavigate(course.name)}
            >
              Open Course
            </Button>
          </div>
        ) : (
          <Button 
            variant="default"
            className="w-full text-xs py-1"
            onClick={() => onJoinLeave(course, enrolled)}
          >
            Join Course
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const EmptyEnrolledState = () => (
  <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
    <div className="w-16 h-16 mb-4 text-gray-400">
      <BookOpen className="w-full h-full" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-1">No enrolled courses</h3>
    <p className="text-sm text-gray-500">Browse the courses below and click "Join Course" to get started!</p>
  </div>
);

export default function Home() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [otherCourses, setOtherCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const addUserToDatabase = async (email, role) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/add_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add user");
      }
    } catch (error) {
      console.error("Error while adding user:", error);
      setError("Failed to add user to database");
    }
  };

  const validateUserAndAssignRole = async () => {
    if (isSignedIn && user) {
      const email = user.primaryEmailAddress?.emailAddress;
      if (!email) {
        setError("No email address found");
        return;
      }

      const domain = email.split("@")[1];
      if (domain !== "fuhsd.org" && domain !== "student.fuhsd.org" && email !== "ayushbheemaiah@gmail.com" && email !== "aarusharya312@gmail.com" && email !== "adityaasureshh@gmail.com") {
        alert("Invalid email domain. Please use an 'fuhsd.org' or 'student.fuhsd.org' email.");
        await signOut();
        router.push("/sign-in");
        return;
      }

      var role = domain === "fuhsd.org" ? "Teacher" : "Student";
      if (email === "ayushbheemaiah@gmail.com" || email === "adityaasureshh@gmail.com" || email === "aarusharya312@gmail.com") {
        role = "Teacher";
      }
      await addUserToDatabase(email, role);
      await fetchUserCourses();
    }
  };

  const fetchUserCourses = async (reload = false) => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    
    try {
      if (reload) {
        setLoading(true);
      }
      
      const response = await fetch(
        `http://127.0.0.1:5000/get_user_courses?email=${encodeURIComponent(user.primaryEmailAddress.emailAddress)}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      
      const data = await response.json();
      setEnrolledCourses(data.enrolled_courses);
      setOtherCourses(data.other_courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeaveCourse = async (course, isEnrolled) => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
  
    const endpoint = isEnrolled ? 'leave_course' : 'join_course';
    const email = user.primaryEmailAddress.emailAddress;
    const name = user.fullName || 'Unknown';
    const domain = email.split("@")[1];
    const isTeacher = domain === "fuhsd.org" || 
                     ["ayushbheemaiah@gmail.com", "aarusharya312@gmail.com", "adityaasureshh@gmail.com"].includes(email);

    try {
     
      if (isEnrolled) {
        setEnrolledCourses(prev => prev.filter(c => c.id !== course.id));
        setOtherCourses(prev => [...prev, {
          ...course,
          students: course.students.filter(s => s !== name),
          teacher_names: isTeacher ? course.teacher_names.filter(t => t !== name) : course.teacher_names
        }]);
      } else {
        setEnrolledCourses(prev => [...prev, {
          ...course,
          students: isTeacher ? course.students : [...(course.students || []), name],
          teacher_names: isTeacher ? [...(course.teacher_names || []), name] : course.teacher_names
        }]);
        setOtherCourses(prev => prev.filter(c => c.id !== course.id));
      }

      const response = await fetch(`http://127.0.0.1:5000/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          course_id: course.id,
          name,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to ${isEnrolled ? 'leave' : 'join'} course`);
      }

    } catch (error) {
      console.error(`Error ${isEnrolled ? 'leaving' : 'joining'} course:`, error);
   
      if (isEnrolled) {
        setEnrolledCourses(prev => [...prev, {
          ...course,
          students: course.students,
          teacher_names: course.teacher_names
        }]);
        setOtherCourses(prev => prev.filter(c => c.id !== course.id));
      } else {
        setOtherCourses(prev => [...prev, {
          ...course,
          students: course.students,
          teacher_names: course.teacher_names
        }]);
        setEnrolledCourses(prev => prev.filter(c => c.id !== course.id));
      }
      setError(`Failed to ${isEnrolled ? 'leave' : 'join'} course`);
    }
  };

  useEffect(() => {
    validateUserAndAssignRole();
  }, [isSignedIn, user]);

  const handleCourseNavigation = (courseName) => {
    const courseSlug = courseName.toLowerCase().replace(/\s+/g, '-');
    router.push(`/courses/${courseSlug}`);
  };

  const notifications = [
    {
      course: "AP Calculus BC",
      message: "New Teacher Resource Posted: Calculus BC Textbook",
      time: "2 hours ago"
    },
    {
      course: "AP US History",
      message: "New Student Resource Posted: Heimler's History Full Playlist Unit 6",
      time: "1 day ago"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-gray-200 border-solid mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold">Please Wait...</h2>
          <p className="text-sm">Your content is on its way.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex bg-gray-50">
      {/* Rest of the JSX remains the same */}
      {/* Notifications Sidebar */}
      <div className="w-1/4 max-w-sm border-r bg-white p-6 overflow-y-auto mt-[65px] shadow-lg">
        <div className="flex items-center gap-2 mb-8">
          <Bell className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <Card key={index} className="shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm">{notification.course}</h3>
                  <div className="flex items-center text-xs text-gray-400 gap-1">
                    <Clock className="w-3 h-3" />
                    {notification.time}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{notification.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto mt-[65px] bg-gray-50">
        {/* My Courses Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">My Courses</h2>
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {enrolledCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  enrolled={true}
                  onNavigate={handleCourseNavigation}
                  onJoinLeave={handleJoinLeaveCourse}
                />
              ))}
            </div>
          ) : (
            <EmptyEnrolledState />
          )}
        </section>

        {/* Other Courses Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Other Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {otherCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                enrolled={false}
                onNavigate={handleCourseNavigation}
                onJoinLeave={handleJoinLeaveCourse}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}