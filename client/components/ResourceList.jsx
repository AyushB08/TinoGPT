import React from 'react';
import { Heart, Trash2, User } from "lucide-react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';

export const ResourceList = ({ 
  resources, 
  onFavorite, 
  onDelete, 
  showDelete = false, 
  showCourse = false 
}) => {
  const handleAction = (e, action, resource) => {
    e.preventDefault();
    e.stopPropagation();
    action(resource);
  };

  return resources.map((resource) => (
    <AccordionItem key={resource.id} value={`item-${resource.id}`}>
      <div className="flex items-center w-full">
        <AccordionTrigger className="flex-1">
          <div className="flex items-center space-x-4 w-full p-4 hover:bg-gray-50">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={resource.author_avatar}
                alt={`${resource.author_name || 'User'}'s avatar`}
              />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-grow text-left">
              <div className="font-semibold">{resource.title}</div>
              {showCourse && resource.courseName && (
                <div className="text-xs text-gray-500">
                  Posted in {resource.courseName}
                </div>
              )}
            </div>
          </div>
        </AccordionTrigger>

        <div className="flex items-center space-x-2 pr-4">
          <div 
            onClick={(e) => handleAction(e, onFavorite, resource)}
            className={`cursor-pointer p-1 rounded-full hover:bg-gray-100 flex items-center ${
              resource.is_favorited ? "text-red-500" : "text-gray-400"
            }`}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleAction(e, onFavorite, resource);
              }
            }}
          >
            <Heart 
              size={20} 
              className={resource.is_favorited ? "fill-current" : ""} 
            />
            <span className="ml-1">{resource.favorites || 0}</span>
          </div>

          {showDelete && onDelete && (
            <div 
              onClick={(e) => handleAction(e, onDelete, resource)}
              className="cursor-pointer p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleAction(e, onDelete, resource);
                }
              }}
            >
              <Trash2 size={20} />
            </div>
          )}
        </div>
      </div>
      
      <AccordionContent className="p-4">
        <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
          <div>
            Posted by: {resource.author_name}
            {resource.createdAt && (
              <span className="ml-2 text-xs">
                {formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
        
        <div className="prose max-w-none">
          {resource.content}
        </div>
      </AccordionContent>
    </AccordionItem>
  ));
};