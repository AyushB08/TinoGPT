import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageCircle, Zap, Shield, ArrowRight } from "lucide-react"

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      

     
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-[#820000]">TinoGPT!</span>
          </h1>
          <p className="text-xl text-black mb-8 max-w-3xl mx-auto">
            Tino GPT is a tranformative, easy to use forum for all courses in CHS, where students can send resources, make posts, 
            and communicate with peers. Teachers can also send official resources and posts regarding classes, enabling interactions between
            students, their peers, and teachers in a new, innovative way. 
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="" className="bg-[#820000] text-white">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>


      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">About TinoGPT</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <MessageCircle className="w-12 h-12 text-[#820000] mb-4" />
              <h3 className="text-xl font-semibold mb-2">Course Resource Forum</h3>
              <p className="text-gray-600">
                Whether you are a student or a teacher, send resources and posts to help peers for almost any course at CHS.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Zap className="w-12 h-12 text-[#820000] mb-4" />
              <h3 className="text-xl font-semibold mb-2">Customize your experience</h3>
              <p className="text-gray-600">
                Join, leave, and favorite courses as you wish to never miss important notifications or updates.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Shield className="w-12 h-12 text-[#820000] mb-4" />
              <h3 className="text-xl font-semibold mb-2">Introducing TinoGPT</h3>
              <p className="text-gray-600">
                With TinoGPT, our cutting-edge AI Chatbot, you never have to feel out of the loop or confused regarding CHS information every again. 
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="py-16 bg-[#820000] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">
            Join dozens of Cupertino High School students already using TinoGPT.
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="secondary" className="bg-yellow-400 text-black hover:bg-gray-100">
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default LandingPage;