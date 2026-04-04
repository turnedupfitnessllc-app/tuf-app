import React from "react"
import { AngleButton } from "@/components/ui/angle-button"
import { VideoPlayer } from "@/components/VideoPlayer"
import { ArrowRight, ShoppingCart, Download, BookOpen, Zap } from "lucide-react"

export default function ComponentShowcase() {
  const videoExamples = [
    {
      title: "Beginner Chest Workout",
      description: "Learn proper form for basic chest exercises. Perfect for beginners starting their fitness journey.",
      category: "Workout",
      duration: "12:45",
      src: "https://example.com/video1.mp4",
    },
    {
      title: "Nutrition 101 for 40+",
      description: "Understanding macros and micronutrients for optimal health and muscle maintenance.",
      category: "Nutrition",
      duration: "8:30",
      src: "https://example.com/video2.mp4",
    },
    {
      title: "Recovery & Sleep Optimization",
      description: "Science-backed strategies to improve recovery and sleep quality for better results.",
      category: "Recovery",
      duration: "15:20",
      src: "https://example.com/video3.mp4",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Component Showcase</h1>
          <p className="text-xl text-gray-400">
            Explore the new UI components and features for TUF App
          </p>
        </div>

        {/* Button Showcase */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="w-1 h-8 bg-red-600 rounded-full" />
            Gradient Angled Buttons
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="flex flex-col gap-4">
              <p className="text-gray-400 text-sm font-semibold">Learn More</p>
              <AngleButton variant="learn-more" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                Learn More
              </AngleButton>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-gray-400 text-sm font-semibold">Buy Now</p>
              <AngleButton variant="buy-now" size="md" icon={<ShoppingCart className="w-4 h-4" />}>
                Buy Now
              </AngleButton>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-gray-400 text-sm font-semibold">Download</p>
              <AngleButton variant="download" size="md" icon={<Download className="w-4 h-4" />}>
                Download
              </AngleButton>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-gray-400 text-sm font-semibold">Read More</p>
              <AngleButton variant="read-more" size="md" icon={<BookOpen className="w-4 h-4" />}>
                Read More
              </AngleButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col gap-4">
              <p className="text-gray-400 text-sm font-semibold">Book Now</p>
              <AngleButton variant="book-now" size="md">
                Book Now
              </AngleButton>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-gray-400 text-sm font-semibold">Watch Now</p>
              <AngleButton variant="watch-now" size="md">
                Watch Now
              </AngleButton>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-gray-400 text-sm font-semibold">Apply Now</p>
              <AngleButton variant="apply-now" size="md">
                Apply Now
              </AngleButton>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-gray-400 text-sm font-semibold">Click Here</p>
              <AngleButton variant="click-here" size="md">
                Click Here
              </AngleButton>
            </div>
          </div>

          {/* Size Variations */}
          <div className="mt-12">
            <h3 className="text-xl font-bold text-white mb-6">Size Variations</h3>
            <div className="flex flex-wrap gap-4">
              <AngleButton variant="primary" size="sm">
                Small
              </AngleButton>
              <AngleButton variant="primary" size="md">
                Medium
              </AngleButton>
              <AngleButton variant="primary" size="lg">
                Large
              </AngleButton>
              <AngleButton variant="primary" size="xl">
                Extra Large
              </AngleButton>
            </div>
          </div>
        </section>

        {/* Video Player Showcase */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="w-1 h-8 bg-red-600 rounded-full" />
            Video Player Component
          </h2>

          <div className="space-y-8">
            {videoExamples.map((video, idx) => (
              <div key={idx} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
                <VideoPlayer
                  src={video.src}
                  title={video.title}
                  description={video.description}
                  category={video.category}
                  duration={video.duration}
                  thumbnail="https://via.placeholder.com/1280x720?text=Video+Thumbnail"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="w-1 h-8 bg-red-600 rounded-full" />
            New Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-red-600 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Gradient Buttons</h3>
              <p className="text-gray-400">
                Beautiful angled buttons with gradient backgrounds and smooth hover effects. 8 unique variants for different actions.
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-red-600 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Video Player</h3>
              <p className="text-gray-400">
                Full-featured video player with controls, progress tracking, volume adjustment, and fullscreen support.
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-red-600 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">JARVIS Chat</h3>
              <p className="text-gray-400">
                AI-powered fitness coach with real-time responses, workout generation, and personalized guidance.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Fitness?</h2>
          <p className="text-red-100 mb-8 text-lg">
            Start your journey with TUF App today and get personalized coaching from JARVIS
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AngleButton variant="buy-now" size="lg" icon={<ArrowRight className="w-5 h-5" />}>
              Get Started
            </AngleButton>
            <AngleButton variant="learn-more" size="lg" icon={<BookOpen className="w-5 h-5" />}>
              Learn More
            </AngleButton>
          </div>
        </section>
      </div>
    </div>
  )
}
