"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Mail, Lock, Globe, Trash2, AlertTriangle } from "lucide-react"

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#101828]">アカウント設定</h1>
        <p className="text-sm text-[#475467] mt-0.5">アカウントの基本設定を管理します</p>
      </div>

      {/* Email */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4E7EC]">
          <h2 className="font-semibold text-[#101828] flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#667085]" />
            メールアドレス
          </h2>
          <p className="text-sm text-[#475467] mt-0.5">ログインに使用するメールアドレスを変更します</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-email" className="text-sm font-medium text-[#344054]">現在のメールアドレス</Label>
            <Input id="current-email" type="email" value="tanaka@example.com" disabled className="rounded-lg border-[#D0D5DD] bg-[#F9FAFB]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-email" className="text-sm font-medium text-[#344054]">新しいメールアドレス</Label>
            <Input id="new-email" type="email" placeholder="新しいメールアドレスを入力" className="rounded-lg border-[#D0D5DD]" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 text-white text-sm font-medium rounded-lg hover:bg-sky-600 transition-colors shadow-sm">
            メールアドレスを変更
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4E7EC]">
          <h2 className="font-semibold text-[#101828] flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#667085]" />
            パスワード
          </h2>
          <p className="text-sm text-[#475467] mt-0.5">アカウントのパスワードを変更します</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-sm font-medium text-[#344054]">現在のパスワード</Label>
            <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="rounded-lg border-[#D0D5DD]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-sm font-medium text-[#344054]">新しいパスワード</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="rounded-lg border-[#D0D5DD]" />
            <p className="text-xs text-[#667085]">8文字以上で、英字と数字を含めてください</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-sm font-medium text-[#344054]">新しいパスワード（確認）</Label>
            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="rounded-lg border-[#D0D5DD]" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 text-white text-sm font-medium rounded-lg hover:bg-sky-600 transition-colors shadow-sm">
            パスワードを変更
          </button>
        </div>
      </div>

      {/* Language */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4E7EC]">
          <h2 className="font-semibold text-[#101828] flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#667085]" />
            言語・地域
          </h2>
          <p className="text-sm text-[#475467] mt-0.5">表示言語と地域を設定します</p>
        </div>
        <div className="px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#344054]">表示言語</Label>
              <Select defaultValue="ja">
                <SelectTrigger className="rounded-lg border-[#D0D5DD]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#344054]">タイムゾーン</Label>
              <Select defaultValue="asia-tokyo">
                <SelectTrigger className="rounded-lg border-[#D0D5DD]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="asia-tokyo">日本標準時（JST）</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border border-[#FDA29B] rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#FDA29B] bg-[#FEF3F2]">
          <h2 className="font-semibold text-[#B42318] flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            危険な操作
          </h2>
          <p className="text-sm text-[#475467] mt-0.5">以下の操作は取り消すことができません</p>
        </div>
        <div className="px-6 py-5 space-y-0">
          <div className="flex items-center justify-between py-4 border-b border-[#F2F4F7]">
            <div>
              <p className="font-medium text-[#101828]">アカウントを一時停止</p>
              <p className="text-sm text-[#475467]">一時的にアカウントを停止し、後から復活できます</p>
            </div>
            <button className="border border-[#D0D5DD] text-[#344054] text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#F9FAFB] transition-colors shadow-sm">
              一時停止
            </button>
          </div>
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-[#B42318]">アカウントを削除</p>
              <p className="text-sm text-[#475467]">すべてのデータが完全に削除されます</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex items-center gap-2 bg-[#D92D20] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#B42318] transition-colors shadow-sm">
                  <Trash2 className="h-4 w-4" />
                  削除
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>本当にアカウントを削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    この操作は取り消すことができません。すべてのデータ、支援履歴、コミュニティへの参加情報が完全に削除されます。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-lg">キャンセル</AlertDialogCancel>
                  <AlertDialogAction className="bg-[#D92D20] hover:bg-[#B42318] text-white rounded-lg">
                    削除する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  )
}
