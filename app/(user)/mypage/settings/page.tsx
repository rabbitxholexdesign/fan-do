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
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-sky-500 uppercase tracking-widest mb-1">マイページ</p>
        <h1 className="text-2xl font-bold text-slate-800">アカウント設定</h1>
        <p className="text-slate-500 mt-0.5">アカウントの基本設定を管理します</p>
      </div>

      {/* Email Settings */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Mail className="h-5 w-5 text-sky-500" />
            メールアドレス
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">ログインに使用するメールアドレスを変更します</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-email" className="text-slate-600 font-medium">現在のメールアドレス</Label>
            <Input
              id="current-email"
              type="email"
              value="tanaka@example.com"
              disabled
              className="rounded-xl border-slate-200 bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-email" className="text-slate-600 font-medium">新しいメールアドレス</Label>
            <Input
              id="new-email"
              type="email"
              placeholder="新しいメールアドレスを入力"
              className="rounded-xl border-slate-200 focus:border-sky-300 focus:ring-sky-200"
            />
          </div>
          <button className="bg-sky-500 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-sky-600 transition-colors">
            メールアドレスを変更
          </button>
        </div>
      </div>

      {/* Password Settings */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Lock className="h-5 w-5 text-sky-500" />
            パスワード
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">アカウントのパスワードを変更します</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-slate-600 font-medium">現在のパスワード</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="rounded-xl border-slate-200 focus:border-sky-300 focus:ring-sky-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-slate-600 font-medium">新しいパスワード</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-xl border-slate-200 focus:border-sky-300 focus:ring-sky-200"
            />
            <p className="text-xs text-slate-400">8文字以上で、英字と数字を含めてください</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-slate-600 font-medium">新しいパスワード（確認）</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-xl border-slate-200 focus:border-sky-300 focus:ring-sky-200"
            />
          </div>
          <button className="bg-sky-500 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-sky-600 transition-colors">
            パスワードを変更
          </button>
        </div>
      </div>

      {/* Language & Region */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Globe className="h-5 w-5 text-sky-500" />
            言語・地域
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">表示言語と地域を設定します</p>
        </div>
        <div className="px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">表示言語</Label>
              <Select defaultValue="ja">
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">タイムゾーン</Label>
              <Select defaultValue="asia-tokyo">
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
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
      <div className="rounded-2xl bg-white border border-red-100 shadow-lg shadow-slate-200/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 bg-red-50/50">
          <h2 className="font-semibold text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            危険な操作
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">以下の操作は取り消すことができません</p>
        </div>
        <div className="px-6 py-5 space-y-0">
          <div className="flex items-center justify-between py-4 border-b border-slate-50">
            <div>
              <p className="font-medium text-slate-800">アカウントを一時停止</p>
              <p className="text-sm text-slate-500">一時的にアカウントを停止し、後から復活できます</p>
            </div>
            <button className="border border-slate-200 text-slate-700 text-sm font-medium px-5 py-2 rounded-full hover:bg-slate-50 transition-colors">
              一時停止
            </button>
          </div>
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-red-600">アカウントを削除</p>
              <p className="text-sm text-slate-500">すべてのデータが完全に削除されます</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex items-center gap-2 bg-red-500 text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                  削除
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>本当にアカウントを削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    この操作は取り消すことができません。
                    すべてのデータ、支援履歴、コミュニティへの参加情報が完全に削除されます。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">キャンセル</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white rounded-full">
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
