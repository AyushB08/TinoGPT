"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus, Bell } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { useRouter, useParams } from 'next/navigation';
import { AddResourceDialog } from "@/components/AddResourceDialog";
import { ResourceList } from "@/components/ResourceList";
import axios from 'axios';
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

export default function CourseDetails() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const courseName = params?.courseName || '';
  
  const formattedCourseName = courseName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  const [resources, setResources] = useState([]);
  const [recentResources, setRecentResources] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log("AARUSH LOOK AT COURSENAME HERE: " + courseName);


  let courseDescription;

  if (courseName === "ap-calculus-bc") {
    courseDescription = {
      [formattedCourseName]: "This college-level math course covers advanced calculus topics, including derivatives, integrals, limits, series, and parametric, polar, and vector functions. The course emphasizes problem-solving, analytical reasoning, and mathematical modeling. "
    };
  } else if (courseName === "AP Computer Science A") {
    courseDescription = {
      [formattedCourseName]: "This rigorous computer science course focuses on programming in Java, covering fundamental concepts such as object-oriented programming, data structures, algorithms, and problem-solving. It prepares students to write, test, and debug programs while analyzing algorithmic efficiency and design principles."
      
    };
  } else if (courseName == "ap-united-states-history") {
    courseDescription = {
      [formattedCourseName]: "A comprehensive college-level course exploring U.S. history from pre-Columbian times to the present. It emphasizes critical analysis of historical events, trends, and themes such as politics, culture, society, and economics. Students develop skills in historical writing, document analysis, and argumentation."
    }
  } else if (courseName == "ap-calculus-ab") {
    courseDescription = {
      [formattedCourseName]: "AP Calculus AB is an advanced mathematics course that covers fundamental concepts of calculus, including limits, derivatives, integrals, and the Fundamental Theorem of Calculus. It emphasizes problem-solving and analytical skills, preparing students for college-level math."
    }
  } else if (courseName == "ap-chemistry") {
    courseDescription = {
      [formattedCourseName]: "A college-level chemistry course that explores advanced topics in chemical principles, including atomic structure, chemical bonding, thermodynamics, kinetics, equilibrium, and acids/bases. Laboratory experiments and quantitative problem-solving are integral, fostering scientific inquiry and critical thinking."
    }
  } else if (courseName == "ap-physics-c") {
    courseDescription = {
      [formattedCourseName]: "AP Physics C is a calculus-based physics course divided into two parts: Mechanics and Electricity & Magnetism. It delves into concepts like motion, forces, energy, electric fields, and circuits, emphasizing quantitative problem-solving and real-world applications."
    }
  }
  else {
    courseDescription = {
      [formattedCourseName]: "Cannot find course description"
    };

  }

  const allowedEmails = [
    "ayushbheemaiah@gmail.com",
    "adityaasureshh@gmail.com",
    "aarusharya312@gmail.com",
  ];



  console.log(courseDescription);

  
  const isTeacher = allowedEmails.includes(user?.primaryEmailAddress?.emailAddress) ||
  (user?.primaryEmailAddress?.emailAddress?.endsWith("@fuhsd.org") ?? false);

  const fetchResources = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      setIsLoading(true);
    
      const response = await axios.get('http://127.0.0.1:5000/get_course_resources', {
        params: { 
          course_name: formattedCourseName,
          email: user.primaryEmailAddress.emailAddress 
        }
      });

      
      const fetchedResources = response.data.resources || [];
      setResources(fetchedResources);
      
    
      const sorted = [...fetchedResources].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      ).slice(0, 5);
      
      setRecentResources(sorted.reverse());
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to fetch resources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalAddResource = (newResource) => {
    
    setResources(prevResources => [
      ...prevResources, 
      {
        ...newResource,
      
        id: Date.now(), 
        section: newResource.section || activeSection
      }
    ]);
    
  
    setRecentResources(prevRecent => {
      const updated = [
        {
          ...newResource,
          id: Date.now(), 
          section: newResource.section || activeSection
        },
        ...prevRecent
      ];
      return updated.slice(0, 5);
    });
  };


  useEffect(() => {
    if (user) {
      fetchResources();
    }
  }, [user, formattedCourseName]);

  const handleAddResource = async (newResource) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/add_course_resource', {
        email: user.primaryEmailAddress.emailAddress,
        user_name: user.fullName,
        user_avatar: user.imageUrl,
        course_name: formattedCourseName,
        title: newResource.title,
        content: newResource.content,
        section: newResource.section || activeSection
      });
  
      if (response.status === 201) {
        
        await fetchResources();
        
        toast.success('Resource added successfully');
        setDialogOpen(false);
      }
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error('Failed to add resource');
      
      
      setResources(prevResources => 
        prevResources.filter(r => r.id !== newResource.id)
      );
      
      throw error;
    }
  };

  const handleFavorite = async (resource) => {
    if (!user?.primaryEmailAddress?.emailAddress) return;


    setResources(prevResources => 
      prevResources.map(r => 
        r.id === resource.id 
          ? { 
              ...r, 
              is_favorited: !r.is_favorited, 
              favorites: r.is_favorited ? r.favorites - 1 : r.favorites + 1 
            } 
          : r
      )
    );

    try {
      const email = user.primaryEmailAddress.emailAddress;
      const action = resource.is_favorited ? 'unfavorite' : 'favorite';
      
      await axios.post(`http://127.0.0.1:5000/${action}_resource`, {
        email,
        resource_id: resource.id
      });

      toast.success(`Resource ${action}d successfully`);
    } catch (error) {
    
      setResources(prevResources => 
        prevResources.map(r => 
          r.id === resource.id 
            ? { 
                ...r, 
                is_favorited: resource.is_favorited, 
                favorites: resource.favorites 
              } 
            : r
        )
      );
      
      console.error('Error updating favorite status:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const formatDate = (dateString) => {
    console.log(dateString + " TESTLOL");
    try {
  
      if (!dateString) {
        return 'Invalid date';
      }
  
    
      const normalizedDateString = dateString.replace(/(\.\d{3})\d+/, '$1');
      
      
      const date = new Date(normalizedDateString);
      

      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  console.log(formatDate("2024-11-22T03:08:37.911000"));
  
  console.log(formatDate("2024-11-22T03:08:37.911000"));
  

  const teacherResources = resources.filter(r => r.section === 'teacher_resources');
  const studentResources = resources.filter(r => r.section === 'student_resources');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 fixed top-0 w-full z-10 pt-[80px]">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Courses
          </Button>
          <h1 className="text-xl font-bold">{formattedCourseName}</h1>
        </div>
      </div>

      <div className="pt-[161px] px-6 py-8 flex gap-6">
        <div className="flex-1 space-y-6">
          {/* Course Description Card */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Course Description</h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {courseDescription[formattedCourseName]}
              </p>
            </CardContent>
          </Card>

          {/* Teacher Resources Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-semibold">Teacher Resources</h2>
              {isTeacher && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setActiveSection("teacher_resources");
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                {isLoading ? (
                  <div className="text-center py-4">Loading resources...</div>
                ) : teacherResources.length === 0 ? (
                  <div className="text-center py-4">No teacher resources available.</div>
                ) : (
                  <ResourceList 
                    resources={teacherResources}
                    onFavorite={handleFavorite}
                    showDelete={false}
                    showCourse={false}
                  />
                )}
              </Accordion>
            </CardContent>
          </Card>

          {/* Student Resources Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-semibold">Student Resources</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setActiveSection("student_resources");
                  setDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                {isLoading ? (
                  <div className="text-center py-4">Loading resources...</div>
                ) : studentResources.length === 0 ? (
                  <div className="text-center py-4">No student resources available.</div>
                ) : (
                  <ResourceList 
                    resources={studentResources}
                    onFavorite={handleFavorite}
                    showDelete={false}
                    showCourse={false}
                  />
                )}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Recent Resources Sidebar */}
        <div className="w-[350px] space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Bell className="mt-2 w-5 h-5  items-center justify-center flex" />
              <h2 className="text-center text-lg font-semibold">Recent Updates</h2>
            </CardHeader>
            <CardContent>
              {recentResources.length === 0 ? (
                <p className="text-gray-500 text-center py-2">No recent updates</p>
              ) : (
                <ul className="space-y-4">
                  {recentResources.map((resource) => (
                    <li key={resource.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                      <div className="flex items-start gap-3">
                        <img 
                          src={resource.author_avatar || '/placeholder-avatar.png'} 
                          alt={resource.author_name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{resource.title}</p>
                          <p className="text-xs text-gray-500">
                            Added by {resource.author_name} • {formatDate(resource.createdAt)}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Section: {resource.section === 'teacher_resources' ? 'Teacher Resources' : 'Student Resources'}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddResourceDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAddResource}
        onLocalAdd={handleLocalAddResource}
        section={activeSection}
        courseName={formattedCourseName}
      />
    </div>
  );
}