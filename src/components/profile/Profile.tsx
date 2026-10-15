import { SaveAll, User } from "lucide-react";
import type React from "react";
import PhoneInput from "../global/PhoneInput";
import { useEffect, useState } from "react";
import LocationSelect from "../global/LocationSelect";
import useAuth from "../../components/hooks/useAuth";
import { adminCaller } from "../../interceptors/http";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import ProfilePageSkeleton from "../global/UserProfileSkeleton";
import { getErrorMessage, type ApiError } from "../../lib/errors";
import { CodeInput, emptyCode } from "../auth/CodeInput";

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const qc = useQueryClient();

  const { data: profile, isLoading } = useAuth();

  // a new email only switches over once the code sent to it is entered
  const [pendingEmail, setPendingEmail] = useState("");
  const [code, setCode] = useState<string[]>(emptyCode);
  const [confirming, setConfirming] = useState(false);
  const emailChanged =
    Boolean(profile?.email) &&
    email.trim().toLowerCase() !== profile.email.toLowerCase();

  const startEmailChange = () =>
    adminCaller
      .post("auth/change-email", { email: email.trim() })
      .then(() => {
        setPendingEmail(email.trim());
        setCode(emptyCode());
        toast.success(`We sent a code to ${email.trim()}`);
      })
      .catch((err: ApiError) => {
        toast.error(getErrorMessage(err, "Couldn't send the code"));
      });

  const confirmEmailChange = () => {
    setConfirming(true);
    adminCaller
      .post("auth/change-email/confirm", {
        email: pendingEmail,
        code: code.join(""),
      })
      .then((res) => {
        sessionStorage.setItem("user_token", res.data?.accessToken);
        sessionStorage.setItem("hangaut_user", JSON.stringify(res.data?.user));
        setPendingEmail("");
        qc.invalidateQueries({ queryKey: ["profile"] });
        qc.invalidateQueries({ queryKey: ["me"] });
        toast.success("Your email is changed");
      })
      .catch((err: ApiError) => {
        setCode(emptyCode());
        toast.error(getErrorMessage(err, "That code didn't work"));
      })
      .finally(() => setConfirming(false));
  };

  const cancelEmailChange = () => {
    setPendingEmail("");
    setEmail(profile?.email ?? "");
  };

  const handleUpdateProfile = () => {
    setLoading(true);

    adminCaller
      .patch("users/profile", {
        firstName,
        lastName,
        email: profile?.email,
        bio,
        address,
        phone,
        country,
        state,
        city,
      })
      .then(async () => {
        qc.invalidateQueries({ queryKey: ["profile"] });
        toast.success("Profile updated successfully");
        if (emailChanged) await startEmailChange();
      })
      .catch((err: ApiError) => {
        toast.error(getErrorMessage(err, "Failed to update profile"));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setEmail(profile.email);
      setBio(profile.bio);
      setAddress(profile.address);
      setPhone(profile.phone);
      setCountry(profile.country);
      setState(profile.state);
      setCity(profile.city);
    }
  }, [profile]);

  if (isLoading) return <ProfilePageSkeleton />;

  return (
    <div className="w-full">
      <div className="w-full">
        <div className="flex items-center gap-5 pb-3">
          {/* <img
            src={profile?.avatar || DEFAULT_HOST_AVATAR}
            alt="Profile"
            className="h-24 w-24 rounded-full object-cover border-4 border-purple-950/10"
          /> */}
          <div className="h-14 w-14 rounded-full object-cover border-4 border-purple-950/10 flex justify-center items-center">
            <h2 className="text-lg font-semibold">
              {profile?.firstName ? profile?.firstName[0].toUpperCase() : "Y"}
              {profile?.lastName ? profile?.lastName[0].toUpperCase() : "N"}
            </h2>
          </div>
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-foreground tracking-tight">
              {profile?.firstName || "User"} {profile?.lastName || "Name"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Personal bio & contact details
            </p>
          </div>
        </div>

        <div className="border-t border-border/50 pt-6 space-y-4">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                First name
              </span>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-purple-600"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Last name
              </span>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-purple-600"
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Email address
            </span>
            <input
              type="email"
              value={email}
              disabled={Boolean(pendingEmail)}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-purple-600 disabled:opacity-60"
            />
            {emailChanged && !pendingEmail && (
              <span className="block text-[11px] text-muted-foreground">
                We'll send a code to the new email to confirm it's yours when you
                save.
              </span>
            )}
          </label>

          {pendingEmail && (
            <div className="space-y-4 rounded-2xl border border-purple-200 bg-purple-50/60 p-4 dark:border-purple-900 dark:bg-purple-950/20">
              <p className="text-xs font-medium text-foreground">
                Enter the 6 digit code we sent to{" "}
                <span className="font-semibold">{pendingEmail}</span>. Your
                email stays {profile?.email} until you do.
              </p>
              <CodeInput value={code} onChange={setCode} />
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelEmailChange}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Keep old email
                </button>
                <button
                  type="button"
                  onClick={startEmailChange}
                  className="rounded-full border border-border px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Resend code
                </button>
                <button
                  type="button"
                  onClick={confirmEmailChange}
                  disabled={confirming || code.some((digit) => !digit)}
                  className="rounded-full bg-purple-950 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 cursor-pointer"
                >
                  {confirming ? "Checking..." : "Confirm new email"}
                </button>
              </div>
            </div>
          )}

          <LocationSelect
            label="Country"
            value={country as string}
            onChange={(value) => setCountry(value)}
            type="country"
          />
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <LocationSelect
              label="State"
              country={country}
              value={state as string}
              onChange={(value) => setState(value)}
              type="state"
            />
            <LocationSelect
              country={country}
              state={state}
              placeholder="Select city"
              label="City"
              value={city as string}
              onChange={(value) => setCity(value)}
              type="city"
            />
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Home address
              </span>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-purple-600"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Phone number
              </span>
              <PhoneInput value={phone} onChange={(value) => setPhone(value)} />
            </label>
          </div>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Bio
            </span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full border border-border/80 bg-muted/20 rounded-2xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-purple-600"
            />
          </label>

          <button
            disabled={loading}
            onClick={handleUpdateProfile}
            className="ml-auto disabled:opacity-55 disabled:cursor-not-allowed flex items-center gap-1.5 rounded-full bg-purple-950 text-white font-semibold py-2.5 lg:py-3 px-4 text-xs md:text-sm shadow-md active:scale-97 transition-all cursor-pointer"
          >
            <SaveAll className="h-3.5 w-3.5" />
            <span>Save changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
