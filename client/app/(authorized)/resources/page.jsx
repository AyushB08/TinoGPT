"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { ResourceList } from "@/components/ResourceList";
import { useUser } from "@clerk/nextjs";
import axios from 'axios';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MyResources() {
  const [resources, setResources] = useState({
    posted: [],
    favorited: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  const fetchResources = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      setIsLoading(true);
      const email = user.primaryEmailAddress.emailAddress;
    
      const [postedResponse, favoritedResponse] = await Promise.all([
        axios.get('http://127.0.0.1:5000/get_user_resources', {
          params: { email }
        }),
        axios.get('http://127.0.0.1:5000/get_favorited_resources', {
          params: { email }
        })
      ]);

      setResources({
        posted: postedResponse.data.resources,
        favorited: favoritedResponse.data.resources
      });
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to fetch resources');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchResources();
    }
  }, [user]);

  const handleDelete = async (resource) => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      await axios.delete('http://127.0.0.1:5000/delete_resource', {
        data: {
          email: user.primaryEmailAddress.emailAddress,
          resource_id: resource.id
        }
      });

       
      setResources(prev => ({
        posted: prev.posted.filter(r => r.id !== resource.id),
        favorited: prev.favorited.filter(r => r.id !== resource.id)
      }));

      toast.success('Resource deleted successfully');
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const handleFavorite = async (resource) => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      const email = user.primaryEmailAddress.emailAddress;
      const action = resource.is_favorited ? 'unfavorite' : 'favorite';
      
      await axios.post(`http://127.0.0.1:5000/${action}_resource`, {
        email,
        resource_id: resource.id
      });

      
      setResources(prev => {
        const updatedResource = { ...resource, is_favorited: !resource.is_favorited };
        
        return {
          posted: prev.posted.map(r => 
            r.id === resource.id ? updatedResource : r
          ),
          favorited: action === 'favorite'
            ? [...prev.favorited, updatedResource]
            : prev.favorited.filter(r => r.id !== resource.id)
        };
      });

      toast.success(`Resource ${action}d successfully`);
    } catch (error) {
      console.error('Error updating favorite status:', error);
      toast.error('Failed to update favorite status');
    }
  };

  if (!user) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          Please log in to view your resources.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="py-20 min-h-screen bg-white">
      <CardHeader>
        <Tabs defaultValue="posted" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posted">My Posted Resources</TabsTrigger>
            <TabsTrigger value="favorited">Favorited Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="posted" className="mt-4">
            <Accordion type="single" collapsible>
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading resources...
                </div>
              ) : resources.posted.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  You haven't posted any resources yet.
                </div>
              ) : (
                <ResourceList
                  resources={resources.posted}
                  onFavorite={handleFavorite}
                  onDelete={handleDelete}
                  showDelete={true}
                  showCourse={true}
                />
              )}
            </Accordion>
          </TabsContent>

          <TabsContent value="favorited" className="mt-4">
            <Accordion type="single" collapsible>
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading resources...
                </div>
              ) : resources.favorited.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  You haven't favorited any resources yet.
                </div>
              ) : (
                <ResourceList
                  resources={resources.favorited}
                  onFavorite={handleFavorite}
                  showCourse={true}
                />
              )}
            </Accordion>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}