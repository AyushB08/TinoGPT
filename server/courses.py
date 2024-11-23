from pymongo import MongoClient
from pymongo.server_api import ServerApi

uri = os.getenv("MONGODB_URI")


client = MongoClient(uri, server_api=ServerApi('1'))

try:
    
    client.admin.command('ping')
    print("Pinged your deployment. Successfully connected to MongoDB!")
    db = client['database']
    courses_collection = db['Courses']
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    exit(1)


def add_courses_to_mongodb():
    courses = [
        {
            "id": 1,
            "name": "AP Calculus BC",
            "teachers": [],
            "teacher_names": [],
            "students": [],
            "image": "https://images.pexels.com/photos/3781338/pexels-photo-3781338.jpeg?auto=compress&cs=tinysrgb&w=800",
            "color": "bg-blue-200"
        },
        {
            "id": 2,
            "name": "AP United States History",
            "teachers": [],
            "teacher_names": [],
            "students": [],
            
            "image": "https://thestatetimes.com/wp-content/uploads/2023/04/History-678x381.jpg",
            "color": "bg-red-200"
        },
        {
            "id": 3,
            "name": "AP Calculus AB",
            "teachers": [],
            "teacher_names": [],
            "students": [],
            "image": "https://scontent-sjc3-1.xx.fbcdn.net/v/t39.30808-6/309595004_472432161587676_2688746193330787741_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=XUZ4WpLEAzMQ7kNvgGA_MMM&_nc_zt=23&_nc_ht=scontent-sjc3-1.xx&_nc_gid=A82WdhYIB1iBkNao1FkVl0b&oh=00_AYDXu_EExW1MbQpCHlfkNbvsaFdvKiPQzQH56rK0iNamtw&oe=6746A8B2",
            "color": "bg-green-200"
        },
        {
            "id": 4,
            "name": "AP Chemistry",
            "teachers": [],
            "teacher_names": [],
            "students": [],
            "image": "https://proventainternational.com/wp-content/uploads/2023/08/yaddayadda_chemistry_photo_from_photography_website_in_the_styl_83c7f42c-bf23-4af0-9791-cefc239d9043.png",
            "color": "bg-purple-200"
        },
        {
            "id": 5,
            "name": "AP Physics C",
            "teachers": [],
            "teacher_names": [],
            "students": [],
            "image": "https://media.istockphoto.com/id/936903524/vector/blackboard-inscribed-with-scientific-formulas-and-calculations-in-physics-and-mathematics-can.webp?s=1024x1024&w=is&k=20&c=t0hLsuRdtnbLwAu5UMC46_ATICIJX0N3KteUaxhFH-0=",
            "color": "bg-indigo-200"
        }
    ]

    try:
 
        result = courses_collection.insert_many(courses)
        print(f"Inserted courses with IDs: {result.inserted_ids}")
    except Exception as e:
        print(f"Failed to insert courses: {e}")


add_courses_to_mongodb()