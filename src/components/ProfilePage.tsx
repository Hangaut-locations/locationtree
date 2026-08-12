import { SaveAll, User } from "lucide-react";
import type React from "react";
// import { DEFAULT_HOST_AVATAR } from "../data/constants";
import type { HostProfile } from "../types/listing";
import PhoneInput from "./global/PhoneInput";
import { useState } from "react";
import LocationSelect from "./global/LocationSelect";

interface ProfilePageProps {
  profile: HostProfile;
  onUpdateProfile: (profile: HostProfile) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [phone, setPhone] = useState("");
  return (
    <div className="mx-auto max-w-2xl px-4 md:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-11 w-11 rounded-2xl bg-purple-950/10 text-purple-950 dark:text-purple-300 flex items-center justify-center">
          <User className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Profile
        </h1>
      </div>

      <div className="rounded-[28px] border border-border bg-card p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-5">
          {/* <img
            src={profile.avatar || DEFAULT_HOST_AVATAR}
            alt="Profile"
            className="h-24 w-24 rounded-full object-cover border-4 border-purple-950/10"
          /> */}
          <div className="h-16 w-16 rounded-full object-cover border-4 border-purple-950/10 flex justify-center items-center">
            <h2 className="text-lg lg:text-xl font-semibold">
              {profile.name
                ? `${profile.name.split(" ")[0][0]} ${profile.name.split(" ")[1][0]}`
                : ""}
            </h2>
          </div>
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-foreground tracking-tight">
              {profile.name || "Your name"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Personal bio & contact details
            </p>
          </div>
        </div>

        <div className="border-t border-border/50 pt-6 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Full name
            </span>
            <input
              defaultValue={profile.name}
              onBlur={(e) =>
                onUpdateProfile({ ...profile, name: e.target.value })
              }
              className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-purple-600"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Email address
            </span>
            <input
              type="email"
              defaultValue={profile.email}
              onChange={(e) =>
                onUpdateProfile({ ...profile, email: e.target.value })
              }
              className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-purple-600"
            />
          </label>

          {/* <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Country
            </span>
            <select
              defaultValue={profile.country}
              onChange={(e) =>
                onUpdateProfile({ ...profile, country: e.target.value })
              }
              className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-purple-600"
            
          </label> */}

          <LocationSelect
            label="Country"
            value={profile.country as string}
            onChange={(value) =>
              onUpdateProfile({ ...profile, country: value })
            }
            type="country"
          />
          <LocationSelect
            label="State"
            country={profile.country}
            value={profile.state as string}
            onChange={(value) => onUpdateProfile({ ...profile, state: value })}
            type="state"
          />
          <LocationSelect
            country={profile.country}
            state={profile.state}
            label="City"
            value={profile.city as string}
            onChange={(value) => onUpdateProfile({ ...profile, city: value })}
            type="city"
          />

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Home address
            </span>
            <input
              defaultValue={profile.location}
              onBlur={(e) =>
                onUpdateProfile({ ...profile, location: e.target.value })
              }
              className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-purple-600"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Phone number
            </span>
            <PhoneInput
              value={phone}
              onChange={(value) => setPhone(value)}
              onBlur={(e) =>
                onUpdateProfile({ ...profile, phone: e.target.value }) as any
              }
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Bio
            </span>
            <textarea
              defaultValue={profile.bio}
              onBlur={(e) =>
                onUpdateProfile({ ...profile, bio: e.target.value })
              }
              rows={4}
              className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-purple-600"
            />
          </label>

          <button
            // onClick={onLoginClick}
            className="ml-auto flex items-center gap-1.5 rounded-full bg-purple-950 text-white font-semibold py-2.5 lg:py-3 px-4 text-xs md:text-sm shadow-md active:scale-97 transition-all cursor-pointer"
          >
            <SaveAll className="h-3.5 w-3.5" />
            <span>Save changes</span>
          </button>

          {/* <div className="flex justify-start items-center gap-1 text-yellow-700">
            <CircleAlert className="w-4 h-4" />
            <p className="text-xs font-medium">
              Changes save automatically as you move out of each field.
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};
