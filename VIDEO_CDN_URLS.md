# TUF App — Video CDN URLs

All 8 videos have been uploaded to CDN. Use these URLs in the VideoPlayer component.

## Video URLs

### Video 1 — Beginner Chest Workout
```
https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/kEcTNDhRBqrbKjij8yHPcF/_users_e72db2bb-567c-4ca9-8c2a-17e00854da58_generated_13367871-5f1f-4cc1-82a9-c3cf3bf2f55a_generated_video_53342b10.mp4
```

### Video 2 — Nutrition 101 for 40+
```
https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/kEcTNDhRBqrbKjij8yHPcF/_users_e72db2bb-567c-4ca9-8c2a-17e00854da58_generated_27d665a5-25c2-4b95-b549-22dbe0042f47_generated_video_7015e133.mp4
```

### Video 3 — Recovery & Sleep Optimization
```
https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/kEcTNDhRBqrbKjij8yHPcF/_users_e72db2bb-567c-4ca9-8c2a-17e00854da58_generated_36cf42e7-19cd-41ca-89bd-f9c93d5866a0_generated_video_8e8e05d0.mp4
```

### Video 4 — Advanced Training
```
https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/kEcTNDhRBqrbKjij8yHPcF/_users_e72db2bb-567c-4ca9-8c2a-17e00854da58_generated_59d0a9c7-cf26-44ec-aa30-f59b7f088692_generated_video_2191bfa2.mp4
```

### Video 5 — Quick Workout Tips
```
https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/kEcTNDhRBqrbKjij8yHPcF/_users_e72db2bb-567c-4ca9-8c2a-17e00854da58_generated_8aa7cb87-c926-44ee-9c5e-8a9965effaff_generated_video_673add76.mp4
```

### Video 6 — Supplement Guide
```
https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/kEcTNDhRBqrbKjij8yHPcF/_users_e72db2bb-567c-4ca9-8c2a-17e00854da58_generated_99cf3d2b-7d37-4d8c-b2fe-49f9fed336bd_generated_video_6082dd63.mp4
```

### Video 7 — Full Body Workout
```
https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/kEcTNDhRBqrbKjij8yHPcF/_users_e72db2bb-567c-4ca9-8c2a-17e00854da58_generated_ab297486-bdde-4136-86f4-b7fba2321d28_generated_video_27bf279d.mp4
```

### Video 8 — Mobility & Stretching
```
https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/kEcTNDhRBqrbKjij8yHPcF/_users_e72db2bb-567c-4ca9-8c2a-17e00854da58_generated_ca85a860-31dc-4ee4-9ff4-0db0df463061_generated_video_185c4d27.mp4
```

---

## Usage Example

```tsx
import { VideoPlayer } from "@/components/VideoPlayer"

const videos = [
  {
    title: "Beginner Chest Workout",
    description: "Learn proper form for basic chest exercises",
    category: "Workout",
    duration: "12:45",
    src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/kEcTNDhRBqrbKjij8yHPcF/_users_e72db2bb-567c-4ca9-8c2a-17e00854da58_generated_13367871-5f1f-4cc1-82a9-c3cf3bf2f55a_generated_video_53342b10.mp4"
  },
  // ... more videos
]

export default function Videos() {
  return (
    <div>
      {videos.map((video) => (
        <VideoPlayer key={video.title} {...video} />
      ))}
    </div>
  )
}
```

---

## Upload Summary

- **Total Videos:** 8
- **Total Size:** 15 MB
- **Upload Status:** ✅ All successful
- **CDN Provider:** CloudFront
- **Access:** Public URLs (no authentication needed)
- **Format:** MP4 (H.264 video codec)

---

## Notes

- All videos are publicly accessible via CDN URLs
- Videos are cached globally for fast delivery
- No local video files in project (prevents deployment timeout)
- URLs are permanent and won't expire
- Use these URLs in VideoPlayer component

---

**Last Updated:** April 4, 2026
**Status:** ✅ Ready for integration
