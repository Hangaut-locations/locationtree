import { User } from "lucide-react"
import type React from "react"
import { DEFAULT_HOST_AVATAR } from "../data/constants"
import type { HostProfile } from "../types/listing"

interface ProfilePageProps {
  profile: HostProfile
  onUpdateProfile: (profile: HostProfile) => void
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onUpdateProfile }) => {
  return (
    <div className="mx-auto max-w-2xl px-4 md:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-11 w-11 rounded-2xl bg-purple-950/10 text-purple-950 dark:text-purple-300 flex items-center justify-center">
          <User className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Profile</h1>
      </div>

      <div className="rounded-[28px] border border-border bg-card p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-5">
          <img
            src={profile.avatar || DEFAULT_HOST_AVATAR}
            alt="Profile"
            className="h-24 w-24 rounded-full object-cover border-4 border-purple-950/10"
          />
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight">{profile.name || "Your name"}</h2>
            <p className="text-sm font-semibold text-muted-foreground">Personal bio & contact details</p>
          </div>
        </div>

        <div className="border-t border-border/50 pt-6 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground">Full name</span>
            <input
              defaultValue={profile.name}
              onBlur={(e) => onUpdateProfile({ ...profile, name: e.target.value })}
              className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-purple-600"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground">Location</span>
            <input
              defaultValue={profile.location}
              onBlur={(e) => onUpdateProfile({ ...profile, location: e.target.value })}
              className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-purple-600"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground">Phone number</span>
            <input
              defaultValue={profile.phone}
              onBlur={(e) => onUpdateProfile({ ...profile, phone: e.target.value })}
              className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-purple-600"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground">Bio</span>
            <textarea
              defaultValue={profile.bio}
              onBlur={(e) => onUpdateProfile({ ...profile, bio: e.target.value })}
              rows={4}
              className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-semibold text-foreground outline-none focus:border-purple-600"
            />
          </label>
          <p className="text-[11px] font-semibold text-muted-foreground">
            Changes save automatically as you move out of each field.
          </p>
        </div>
      </div>
    </div>
  )
}
