import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface CardFormProps {
  showToast?: boolean
}

export default function CardForm({ showToast }: CardFormProps) {
  return (
    <div className="px-5 pt-4">
      {showToast && (
        <div className="bg-moss-bg rounded-[8px] px-3 py-2 text-[11px] text-moss mb-4 flex items-center gap-[6px]">
          ✓ <strong>ephemeral</strong> 추가 완료
        </div>
      )}

      <div className="space-y-[10px]">
        <div>
          <Label>단어 *</Label>
          <Input
            placeholder="ubiquitous"
            className="font-display text-[16px] py-[14px]"
          />
        </div>
        <div>
          <Label>뜻 *</Label>
          <Input placeholder="어디에나 있는, 아주 흔한" />
        </div>
        <div>
          <Label>
            예문 <span className="opacity-40">(선택)</span>
          </Label>
          <Textarea
            placeholder="Smartphones have become ubiquitous in modern society."
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Label>
              발음 <span className="opacity-40">(선택)</span>
            </Label>
            <Input placeholder="/juːˈbɪkwɪtəs/" />
          </div>
          <div className="flex-1">
            <Label>
              태그 <span className="opacity-40">(선택)</span>
            </Label>
            <Input placeholder="고급어휘" />
          </div>
        </div>
      </div>
    </div>
  )
}
