import { Edit2Icon, EditIcon, SaveAll, User } from "lucide-react";
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

export const HostProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <div className="rounded-[28px] border border-border bg-card p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200 ease-out">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Click avatar to edit profile */}
        {/* <button
              onClick={() => setSection("listings")}
              className="relative group shrink-0 cursor-pointer"
              aria-label="Edit profile"
            >
              <img
                src={profile.avatar || DEFAULT_HOST_AVATAR}
                alt="Host profile"
                className="h-28 w-28 rounded-full object-cover border-4 border-purple-950/10"
              />
              <span className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-purple-950 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Pencil className="h-4 w-4" />
              </span>
            </button> */}
        <div className="h-16 w-16 rounded-full object-cover border-4 border-purple-950/10 flex justify-center items-center">
          <h2 className="lg:text-lg font-semibold">
            {profile.name
              ? `${profile.name.split(" ")[0][0]} ${profile.name.split(" ")[1][0]}`
              : ""}
          </h2>
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-lg md:text-xl font-semibold text-foreground tracking-tight">
            {profile.name || "Your name"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {profile.location ? `${profile.location} · ` : ""}
            {profile.phone || "add phone"}
          </p>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-3 flex justify-start items-center gap-1 rounded-full border border-border px-5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <Edit2Icon className="w-3.5 h-3.5" />
              <span>Edit profile</span>
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-border/50 pt-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Full name
            </span>
            <input
              readOnly={!isEditing}
              defaultValue={profile.name}
              onBlur={(e) =>
                onUpdateProfile({ ...profile, name: e.target.value })
              }
              placeholder="Introduce yourself — full name"
              className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-purple-600"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Email address
            </span>
            <input
              type="email"
              readOnly={!isEditing}
              defaultValue={profile.email}
              onBlur={(e) =>
                onUpdateProfile({ ...profile, name: e.target.value })
              }
              placeholder="Enter email address"
              className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-purple-600"
            />
          </label>
          <LocationSelect
            label="Country"
            disabled={!isEditing}
            value={profile.country as string}
            onChange={(value) =>
              onUpdateProfile({ ...profile, country: value })
            }
            type="country"
          />
          <LocationSelect
            disabled={!isEditing}
            label="State"
            country={profile.country}
            value={profile.state as string}
            onChange={(value) => onUpdateProfile({ ...profile, state: value })}
            type="state"
          />
          <LocationSelect
            disabled={!isEditing}
            country={profile.country}
            state={profile.state}
            label="City"
            value={profile.city as string}
            onChange={(value) => onUpdateProfile({ ...profile, city: value })}
            type="city"
          />

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Phone number
            </span>
            <PhoneInput
              disabled={!isEditing}
              value={profile.phone}
              // onChange={(value) => setPhone(value)}
              onChange={(value) =>
                onUpdateProfile({
                  ...profile,
                  phone: value,
                }) as any
              }
            />
          </label>

          <label className="block space-y-1.5 col-span-full">
            <span className="text-xs font-medium text-muted-foreground">
              Address
            </span>
            <input
              readOnly={!isEditing}
              defaultValue={profile.location}
              onBlur={(e) =>
                onUpdateProfile({ ...profile, location: e.target.value })
              }
              placeholder="City"
              className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-purple-600"
            />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            About me / Bio
          </span>
          <textarea
            readOnly={!isEditing}
            defaultValue={profile.bio}
            onBlur={(e) => onUpdateProfile({ ...profile, bio: e.target.value })}
            rows={4}
            placeholder="Tell guests a little about yourself and what you love hosting…"
            className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-purple-600"
          />
        </label>

        {/* <p className="text-xs text-muted-foreground">
              Tip: click your profile picture to edit your profile. Changes save
              as you type out of each field.
            </p> */}
      </div>

      {isEditing && (
        <div className="w-full flex justify-end items-center gap-2">
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-1.5 rounded-full border text-black font-semibold py-2.5 lg:py-3 px-4 text-xs md:text-sm active:scale-97 transition-all cursor-pointer"
          >
            <span>Cancel</span>
          </button>
          <button
            // onClick={onLoginClick}
            className="flex items-center gap-1.5 rounded-full bg-purple-950 text-white font-semibold py-2.5 lg:py-3 px-4 text-xs md:text-sm shadow-md active:scale-97 transition-all cursor-pointer"
          >
            <SaveAll className="h-3.5 w-3.5" />
            <span>Save changes</span>
          </button>
        </div>
      )}
    </div>
  );
};
