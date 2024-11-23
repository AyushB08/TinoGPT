from flask import Flask, request, jsonify
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from flask_cors import CORS
import os
from dotenv import load_dotenv
from datetime import datetime
from bson import ObjectId


load_dotenv()

app = Flask(__name__)
CORS(app)


uri = os.getenv("MONGODB_URI")
client = MongoClient(uri, server_api=ServerApi('1'))

try:
    
    client.admin.command('ping')
    print("Successfully connected to MongoDB!")
    db = client['database']
    users_collection = db['Users']
    courses_collection = db['Courses']
    resources_collection = db['Resources']
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    exit(1)


def transform_resource(resource, user_email=None):
    return {
        "id": str(resource['_id']),
        "title": resource['title'],
        "content": resource['content'],
        "courseName": resource.get('course_name', 'Unknown Course'),
        "section": resource.get('section', ''),
        "createdAt": resource['createdAt'].isoformat() if isinstance(resource['createdAt'], datetime) else resource['createdAt'],
        "author_name": resource.get('author_name', ''),
        "author_email": resource.get('author_email', ''),
        "author_avatar": resource.get('author_avatar', ''),
        "is_favorited": user_email in resource.get('favorited_by', []) if user_email else False,
        "favorites": len(resource.get('favorited_by', []))
    }

@app.route('/add_user', methods=['POST'])
def add_user():
    try:
        data = request.json
        email = data.get('email')
        role = data.get('role')

        if not email or not role:
            return jsonify({"error": "Email and role are required"}), 400

        
        existing_user = users_collection.find_one({"email": email})
        if existing_user:
            return jsonify({"message": "User already exists"}), 200

 
        user_data = {
            "email": email,
            "role": role,
            "enrolled_courses": []
        }
        users_collection.insert_one(user_data)
        return jsonify({"message": "User added successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_user_courses', methods=['GET'])
def get_user_courses():
    try:
        email = request.args.get('email')
        if not email:
            return jsonify({"error": "Email is required"}), 400

        enrolled_courses = []
        other_courses = []

     
        all_courses = list(courses_collection.find({}, {'_id': 0}))

        for course in all_courses:
            if email in course.get('students', []) or email in course.get('teachers', []):
                enrolled_courses.append(course)
            else:
                other_courses.append(course)

        return jsonify({
            "enrolled_courses": enrolled_courses,
            "other_courses": other_courses
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_course_resources', methods=['GET'])
def get_course_resources():
    try:
        course_name = request.args.get('course_name')
        email = request.args.get('email')
        
        if not course_name:
            return jsonify({"error": "Course name is required"}), 400

  
        resources = list(resources_collection.find({"course_name": course_name}))
        
       
        transformed_resources = [transform_resource(resource, email) for resource in resources]
        
        return jsonify({"resources": transformed_resources}), 200

    except Exception as e:
        print(f"Error in get_course_resources: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/join_course', methods=['POST'])
def join_course():
    try:
        data = request.json
        email = data.get('email')
        course_id = data.get('course_id')
        name = data.get('name')

        if not email or not course_id:
            return jsonify({"error": "Email and course_id are required"}), 400

        
        user = users_collection.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404

      
        course = courses_collection.find_one({"id": course_id})
        if not course:
            return jsonify({"error": "Course not found"}), 404

        update_field = "students"
        if user['role'] == "Teacher":
            update_field = "teachers"
      
            courses_collection.update_one(
                {"id": course_id},
                {
                    "$addToSet": {
                        "teacher_names": name,
                        "teachers": email
                    }
                }
            )
        else:
            
            courses_collection.update_one(
                {"id": course_id},
                {"$addToSet": {"students": email}}
            )

        
        users_collection.update_one(
            {"email": email},
            {"$addToSet": {"enrolled_courses": course_id}}
        )

        return jsonify({"message": f"Successfully joined course as {user['role']}"}), 200

    except Exception as e:
        print(f"Error in join_course: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/leave_course', methods=['POST'])
def leave_course():
    try:
        data = request.json
        email = data.get('email')
        course_id = data.get('course_id')
        name = data.get('name')

        if not email or not course_id:
            return jsonify({"error": "Email and course_id are required"}), 400

      
        user = users_collection.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404

       
        course = courses_collection.find_one({"id": course_id})
        if not course:
            return jsonify({"error": "Course not found"}), 404

        update_field = "students"
        if user['role'] == "Teacher":
            update_field = "teachers"
           
            courses_collection.update_one(
                {"id": course_id},
                {
                    "$pull": {
                        "teacher_names": name,
                        "teachers": email
                    }
                }
            )
        else:
            
            courses_collection.update_one(
                {"id": course_id},
                {"$pull": {"students": email}}
            )


        users_collection.update_one(
            {"email": email},
            {"$pull": {"enrolled_courses": course_id}}
        )

        return jsonify({"message": f"Successfully left course"}), 200

    except Exception as e:
        print(f"Error in leave_course: {e}")
        return jsonify({"error": str(e)}), 500
        
@app.route('/add_course_resource', methods=['POST'])
def add_course_resource():
    try:
        data = request.json
        required_fields = ['email', 'user_name', 'course_name', 'title', 'content', 'section']
        print(data["section"])
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        
        new_resource = {
            "title": data['title'],
            "content": data['content'],
            "course_name": data['course_name'],
            "section": data['section'],
            "author_email": data['email'],
            "author_name": data['user_name'],
            "author_avatar": data.get('user_avatar', ''),
            "createdAt": datetime.utcnow(),
            "favorited_by": [],
        }


        result = resources_collection.insert_one(new_resource)
        
        if not result.inserted_id:
            return jsonify({"error": "Failed to add resource"}), 500

        return jsonify({
            "message": "Resource added successfully",
            "resource_id": str(result.inserted_id)
        }), 201

    except Exception as e:
        print(f"Error in add_course_resource: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/get_user_resources', methods=['GET'])
def get_user_resources():
    try:
        email = request.args.get('email')
        if not email:
            return jsonify({"error": "Email is required"}), 400

   
        resources = list(resources_collection.find({"author_email": email}))
        
        
        transformed_resources = [transform_resource(resource, email) for resource in resources]
        
        return jsonify({"resources": transformed_resources}), 200

    except Exception as e:
        print(f"Error in get_user_resources: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/get_favorited_resources', methods=['GET'])
def get_favorited_resources():
    try:
        email = request.args.get('email')
        if not email:
            return jsonify({"error": "Email is required"}), 400

       
        resources = list(resources_collection.find({"favorited_by": email}))
        
   
        transformed_resources = [transform_resource(resource, email) for resource in resources]
        
        return jsonify({"resources": transformed_resources}), 200

    except Exception as e:
        print(f"Error in get_favorited_resources: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/favorite_resource', methods=['POST'])
def favorite_resource():
    try:
        data = request.json
        email = data.get('email')
        resource_id = data.get('resource_id')

        if not email or not resource_id:
            return jsonify({"error": "Email and resource_id are required"}), 400

        
        result = resources_collection.update_one(
            {"_id": ObjectId(resource_id)},
            {"$addToSet": {"favorited_by": email}}
        )

        if result.modified_count == 0:
            return jsonify({"message": "Resource already favorited"}), 200

        return jsonify({"message": "Resource favorited successfully"}), 200

    except Exception as e:
        print(f"Error in favorite_resource: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/unfavorite_resource', methods=['POST'])
def unfavorite_resource():
    try:
        data = request.json
        email = data.get('email')
        resource_id = data.get('resource_id')

        if not email or not resource_id:
            return jsonify({"error": "Email and resource_id are required"}), 400

      
        result = resources_collection.update_one(
            {"_id": ObjectId(resource_id)},
            {"$pull": {"favorited_by": email}}
        )

        if result.modified_count == 0:
            return jsonify({"message": "Resource was not favorited"}), 200

        return jsonify({"message": "Resource unfavorited successfully"}), 200

    except Exception as e:
        print(f"Error in unfavorite_resource: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/delete_resource', methods=['DELETE'])
def delete_resource():
    try:
        data = request.json
        email = data.get('email')
        resource_id = data.get('resource_id')

        if not email or not resource_id:
            return jsonify({"error": "Email and resource_id are required"}), 400

       
        resource = resources_collection.find_one({
            "_id": ObjectId(resource_id),
            "author_email": email
        })

        if not resource:
            return jsonify({"error": "Resource not found or unauthorized"}), 404

      
        result = resources_collection.delete_one({
            "_id": ObjectId(resource_id),
            "author_email": email
        })

        if result.deleted_count == 0:
            return jsonify({"error": "Failed to delete resource"}), 500

        return jsonify({"message": "Resource deleted successfully"}), 200

    except Exception as e:
        print(f"Error in delete_resource: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host='127.0.0.1', port=5000)